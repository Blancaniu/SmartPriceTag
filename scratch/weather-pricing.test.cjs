const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => {
    if (name in mocks) return mocks[name];
    throw Error(`Unexpected import: ${name}`);
  }, Date, URL, URLSearchParams, AbortSignal, ...mocks.globals });
  return exports;
}
const demand = load('app/lib/weatherDemand.ts');
const pricing = load('app/lib/pricingEngine.ts', { '@/app/data/foodData': { foodItems: [] } });
const date = offset => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const item = { id: 'test', name: 'Milk', category: 'Dairy', stockDate: date(-4), expiryDate: date(2), originalPrice: 10 };
const weather = { status: 'available', observedAt: new Date().toISOString(), ...demand.estimateWeatherDemand(501, 20, 2, 1) };

test('weather rules distinguish normal, reduced and low traffic without stacking', () => {
  assert.equal(demand.estimateWeatherDemand(800, 22, 2, 0).discountPoints, 0);
  assert.equal(weather.discountPoints, 5);
  for (const args of [[211,20,2,0], [601,2,1,0], [800,39,1,0], [800,20,15,0], [502,20,3,5]]) {
    assert.equal(demand.estimateWeatherDemand(...args).discountPoints, 10);
  }
});
test('weather changes price, preserves freshness and survives recalculation without stacking', () => {
  const base = pricing.calculatePricing(item);
  const adjusted = pricing.calculatePricing(item, undefined, weather);
  assert.equal(adjusted.freshnessScore, base.freshnessScore);
  assert.equal(adjusted.discountPercentage, base.discountPercentage + 5);
  assert.equal(pricing.calculatePricing(adjusted).discountedPrice, adjusted.discountedPrice);
  assert.equal(pricing.calculatePricing(adjusted, { min: 8, max: 10 }).discountedPrice, 8);
});
test('missing, stale and expired weather do not add discounts', () => {
  assert.equal(pricing.calculatePricing(item).weatherDiscountPoints, 0);
  assert.equal(pricing.calculatePricing(item, undefined, { ...weather, observedAt: '2020-01-01' }).weatherDiscountPoints, 0);
  assert.equal(pricing.calculatePricing({ ...item, expiryDate: date(-1) }, undefined, weather).weatherDiscountPoints, 0);
});
test('weather API uses chosen location and handles missing key, failures and stale readings', async () => {
  const env = { OPENWEATHER_API_KEY: 'test' };
  let mode = 'ok';
  const provider = load('app/lib/openWeather.ts', {
    './weatherDemand': demand,
    'next/headers': { cookies: async () => ({ get: () => ({ value: 'Melbourne%2C%20AU' }) }) },
    globals: { process: { env }, fetch: async url => {
      if (mode === 'fail') throw Error('offline');
      if (url.pathname.includes('/geo/')) {
        assert.equal(url.searchParams.get('q'), 'Melbourne, AU');
        return { ok: true, json: async () => [{ lat: -37.8, lon: 144.9 }] };
      }
      return { ok: true, json: async () => ({ weather: [{ id: 501, description: 'rain' }], main: { temp: 20 }, wind: { speed: 2 }, dt: mode === 'stale' ? 1 : Date.now() / 1000 }) };
    } },
  });
  assert.equal((await provider.getWeatherDemand()).discountPoints, 5);
  mode = 'fail'; assert.equal((await provider.getWeatherDemand()).discountPoints, 0);
  mode = 'stale'; assert.equal((await provider.getWeatherDemand()).status, 'unavailable');
  env.OPENWEATHER_API_KEY = ''; assert.equal((await provider.getWeatherDemand()).status, 'unavailable');
});

test('browser coordinates bypass geocoding; invalid coordinates fall back to the city', async () => {
  let coordinateCookie = '-33.869%2C151.209';
  let geoCalls = 0;
  const provider = load('app/lib/openWeather.ts', {
    './weatherDemand': demand,
    'next/headers': { cookies: async () => ({ get: name => ({ value: name === 'store-weather-coordinates' ? coordinateCookie : 'Sydney%2C%20AU' }) }) },
    globals: { process: { env: { OPENWEATHER_API_KEY: 'test' } }, fetch: async url => {
      if (url.pathname.includes('/geo/')) {
        geoCalls++;
        assert.equal(url.searchParams.get('q'), 'Sydney, AU');
        return { ok: true, json: async () => [{ lat: -33.869, lon: 151.209 }] };
      }
      assert.equal(url.searchParams.get('lat'), '-33.869');
      assert.equal(url.searchParams.get('lon'), '151.209');
      return { ok: true, json: async () => ({ name: 'Sydney', weather: [{ id: 800 }], main: { temp: 20 }, wind: { speed: 2 }, dt: Date.now() / 1000 }) };
    } },
  });
  assert.equal((await provider.getWeatherDemand()).location, 'Sydney');
  assert.equal(geoCalls, 0);
  for (const invalid of ['91,0', '0,181', '%broken', ',']) {
    coordinateCookie = invalid;
    assert.equal((await provider.getWeatherDemand()).status, 'available');
  }
  assert.equal(geoCalls, 4);
});

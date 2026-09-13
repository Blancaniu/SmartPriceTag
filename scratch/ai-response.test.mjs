import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const source = readFileSync(new URL("../app/components/AiResponse.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {}, require: createRequire(import.meta.url) };
vm.runInNewContext(compiled, context);
const render = text => renderToStaticMarkup(createElement(context.exports.default, { text }));

test("renders meal and cost tables as semantic tables instead of flattened pipe text", () => {
  const html = render("Meal plan\n| Day | Breakfast | Lunch |\n| --- | --- | --- |\n| 1 | Strawberry smoothie | Fruit salad |\n\n---\n\n### Total cost\n| Product | Price |\n| --- | --- |\n| Apples | **$2.00** |\n| **Total** | **$2.00** |");
  assert.equal((html.match(/<table>/g) || []).length, 2);
  assert.match(html, /<th scope="col">Breakfast<\/th>/);
  assert.match(html, /<td>Strawberry smoothie<\/td>/);
  assert.match(html, /<strong>\$2.00<\/strong>/);
  assert.match(html, /<hr\/>/);
  assert.doesNotMatch(html, /\| ---|\*\*/);
});

test("keeps lists, emphasis, and tables separate without blank lines", () => {
  const html = render("- **Storage:** Keep chilled.\n| Item | Amount |\n| :--- | ---: |\n| Fruit | 2 |\n\n*Follow package dates.*");
  assert.match(html, /<ul>.*<strong>Storage:<\/strong>.*<\/ul><div class="ai-response-table"/);
  assert.match(html, /<em>Follow package dates.<\/em>/);
});

test("renders model-supplied HTML as inert text", () => {
  const html = render("| Item | Note |\n| --- | --- |\n| Apple | <img src=x onerror=alert(1)> |");
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
});

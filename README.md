# F-freshie

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Further advice with Groq

Add a key from [Groq](https://console.groq.com/keys) to `.env.local` and restart the development server:

```dotenv
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

The personal product page's **Further advice** button calls `/api/advice`. The server loads the product and sends its type, calculated freshness score, expiry information and ingredients to Groq. The key stays on the server. Without a key, or if Groq fails, the page labels the result as standard guidance. Expired products receive a fixed caution instead of generated advice.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Weather-adjusted discounts

Choose **Use my location** to request browser geolocation, or enter a city manually. Geolocation requires browser permission and HTTPS (or localhost). Coordinates are rounded to three decimal places, saved for 24 hours in this browser and sent to OpenWeather for current weather. Applying a manual city clears the saved coordinates.

Set `OPENWEATHER_API_KEY` in `.env.local`, restart the server, and select a city and country (for example `Sydney, AU`) in the dashboard. The location is saved for this browser. `OPENWEATHER_LOCATION` is an optional server default.

The server uses [OpenWeather current weather](https://openweathermap.org/current) with metric units, cached for 10 minutes. Refresh the dashboard to update prices. Failed requests, missing configuration and readings over two hours old apply no weather adjustment.

Initial business rules add 5 discount percentage points for rain/drizzle, reduced visibility, wind of at least 8 m/s or heat of at least 32°C. Thunderstorms, snow, tornadoes, rain of at least 4 mm/h, wind of at least 14 m/s, temperatures at least 38°C or at most 0°C add 10 points instead. Rules do not stack. Other conditions add zero. These are estimates of reduced visits, not predictions learned from sales data.

Weather does not change freshness. Combined discounts are capped at 75%, then existing price bounds apply. Expired items get no extra weather discount. Future simulations hold current weather constant, rather than forecasting it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

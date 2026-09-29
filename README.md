# Gameboxd Dashboard (React + Vite)

This project includes a Gameboxd-style dashboard UI with icons, cards, quick filters, social/news side rails, and live gaming news data.

## Games Catalog Page (RAWG)

- Open the Catalog tab in the dashboard to view the RAWG-powered catalog page.
- Catalog supports search, genre filter, platform filter, sorting, and pagination.
- Catalog data is loaded from `https://api.rawg.io/api/games` via `src/services/rawgCatalog.js`.
- The configured RAWG key is: `3acbc16a2a3e45ff836afb04989610fb`.

## Setup

1. Install dependencies and start the dev server:

```
npm.cmd install
npm.cmd run dev
```

2. Configure YouTube Data API key for trailers:

Create a `.env` file in the project root with:

```
VITE_YOUTUBE_API_KEY=your_youtube_data_api_key
```

Trailer search on the Game Details screen uses the official YouTube endpoint:
`https://youtube.googleapis.com/youtube/v3/search`

## How Gaming News API is integrated

- Frontend uses `apify-client` in `src/services/gamingNews.js`.
- The service runs Apify actor `visita/games-esports-news-intelligence` and reads its dataset output.
- The provided Apify token is configured in the service file.
- Trending card loads 6 gaming headlines with image, source, and publish date.
- Gaming News panel loads 3 latest gaming headlines as clickable links.

## Scripts

- `npm run dev` starts local development server
- `npm run build` creates production build
- `npm run preview` previews production build
- `npm run lint` runs ESLint

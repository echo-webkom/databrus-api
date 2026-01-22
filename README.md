# Databrus FC API

A Bun-powered HTTP REST API that scrapes match data and league standings from the Profixio website for Bergen Innefotball 5-side Futsal 2025/2026.

## Setup

Install dependencies:

```bash
bun install
```

## Running Locally

Start the development server:

```bash
bun run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

- `GET /` - API information
- `GET /matches` - All matches (upcoming and previous)
- `GET /table` - League standings

## Development

```bash
bun run dev          # Start with hot reload
bun test             # Run tests
bun run check        # Run formatting, linting, and type checks
```

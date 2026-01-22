# Module Organization

## Overview
The codebase is organized into a modular structure for better maintainability and readability.

## Directory Structure

```
src/
├── types/          # TypeScript type definitions
├── config/         # Configuration files (URLs, constants)
├── utils/          # Utility functions (caching, helpers)
├── services/       # Business logic and data processing
└── routes/         # HTTP route handlers
```

## Module Responsibilities

### `src/types/match.ts`
**Purpose**: Type definitions for the application

**Exports**:
- `MatchType`: Union type for "upcoming" | "previous"
- `Match`: Interface defining the structure of match data

**Used by**: All other modules for type safety

---

### `src/config/urls.ts`
**Purpose**: Centralized configuration for external URLs

**Exports**:
- `KOMMENDE_URL`: URL for upcoming matches
- `HISTORIKK_URL`: URL for previous matches

**Used by**: `src/services/matches.ts`

---

### `src/utils/cache.ts`
**Purpose**: In-memory caching implementation

**Exports**:
- `InMemoryCache<T>`: Generic cache class with TTL support

**Used by**: `src/services/scraper.ts`

**Key Features**:
- Time-to-live (TTL) expiration
- Automatic cache invalidation
- Generic type support
- Simple get/set/clear/size interface

---

### `src/services/scraper.ts`
**Purpose**: Core HTML parsing and data extraction logic with caching

**Exports**:
- `fetchAndParseMatches()`: Fetches HTML from URL and extracts match data

**Dependencies**:
- `cheerio`: For HTML parsing
- `src/types/match.ts`: For type definitions
- `src/utils/cache.ts`: For parsed data caching

**Used by**: `src/services/matches.ts`

**Key Features**:
- **Intelligent caching**: Caches parsed match data (not raw HTML) for 30 minutes
- **Performance optimization**: 29x faster response times on cache hits
- Parses `<li>` tags with `wire:key` attributes
- Extracts match ID, teams, time, and scores
- Handles both upcoming (no scores) and previous (with scores) matches

**Internal Functions**:
- `parseMatches()`: Private function that performs HTML parsing
- Uses cache key format: `${url}:${type}` to cache separately by match type

---

### `src/services/matches.ts`
**Purpose**: High-level service layer for match data retrieval

**Exports**:
- `getUpcomingMatches()`: Fetches upcoming matches
- `getPreviousMatches()`: Fetches previous matches
- `getAllMatches()`: Fetches both types in parallel

**Dependencies**:
- `src/services/scraper.ts`: For data fetching
- `src/config/urls.ts`: For URL configuration
- `src/types/match.ts`: For type definitions

**Used by**: `src/routes/index.ts`

---

### `src/routes/index.ts`
**Purpose**: HTTP route handlers and request/response logic

**Exports**:
- `routes`: Object containing all route handlers

**Routes**:
- `GET /`: API information
- `GET /matches`: All matches (upcoming and previous)

**Dependencies**:
- `src/services/matches.ts`: For data retrieval

**Used by**: `index.ts`

**Key Features**:
- Error handling for all endpoints
- JSON response formatting
- HTTP status codes
- Single endpoint design - client-side filtering by match type

---

### `index.ts` (root)
**Purpose**: Application entry point

**Responsibilities**:
- Initialize Bun server
- Configure server settings (port, HMR)
- Import and apply routes

**Dependencies**:
- `src/routes/index.ts`: For route configuration

---

## Data Flow

```
User Request
    ↓
index.ts (Server)
    ↓
src/routes/index.ts (Route Handler)
    ↓
src/services/matches.ts (Service Layer)
    ↓
src/services/scraper.ts (Scraping Logic)
    ↓
External Website (Profixio)
    ↓
src/services/scraper.ts (Parse HTML)
    ↓
src/services/matches.ts (Combine/Format Data)
    ↓
src/routes/index.ts (Create Response)
    ↓
index.ts (Send Response)
    ↓
User receives JSON
```

## Adding New Features

### To add a new endpoint:
1. Add route handler in `src/routes/index.ts`
2. If needed, add new service function in `src/services/matches.ts`
3. If needed, update types in `src/types/match.ts`

### To add new data source:
1. Add URL to `src/config/urls.ts`
2. Create new service function in `src/services/matches.ts`
3. Reuse or extend `src/services/scraper.ts` logic

### To modify data structure:
1. Update interface in `src/types/match.ts`
2. Update scraping logic in `src/services/scraper.ts`
3. TypeScript will catch any inconsistencies

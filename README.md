# Events7 Analytics Dashboard

## Project Description

Events7 is an internal web tool built for the Analytics team to define and manage client events (such as button clicks) for tracking across mobile apps. It enables CRUD (Create, Read, Update, Delete) operations on event definitions with fields: `id`, `name`, `description`, `type` (crosspromo, liveops, app, ads), and `priority` (0-10). "ads" selection is restricted by geographical office using external GeoIP logic.


<img width="881" height="409" alt="image" src="https://github.com/user-attachments/assets/342d50a8-61a0-47ca-bb2d-cc1b261ed497" />

## Monorepo Structure

- `/frontend` - Vue 3 application (Vite)
- `/backend` - NestJS REST API server

## Setup Instructions

### Prerequisites

- Node.js v18+

### Install Dependencies

```
cd backend && npm install
cd ../frontend && npm install
```

### Running the Apps

Backend (NestJS):

```
cd backend
npm run start:dev
```

Frontend (Vue 3):

```
cd frontend
npm run dev
```

Apps will run on ports 3000 (backend) and 5173 (frontend) by default.

## "Ads" Selection Logic

- Uses `ip-api.com` to get user country (via backend API call)
- Checks ads creation permission via external API:
  - Endpoint: [fun7-ad-partner-expertise-test](https://europe-west1-o7tools.cloudfunctions.net/fun7-ad-partner-expertise-test?countryCode=XX)
  - Basic auth is required
  - If response: `{ "ads": "sure, why not!" }` --> allow "ads" type
  - If response: `{ "ads": "you shall not pass!" }` --> disallow "ads" type

## Assumptions / Notes

- There is only one office per country
- Geo IP is checked server-side for reliability
- Auth is not implemented (future enhancement)
- Event `id` is auto-generated (UUID)

**Add more assumptions as necessary here while implementing.**

## Internationalization (i18n)

### Translation System

The frontend implements a comprehensive translation system for better maintainability and international support:

- **Translation file**: `/frontend/src/locales/translations.json`
- **Supported languages**: English (en), Spanish (es), French (fr)
- **Benefits**:
  - **Performance**: All translations loaded once, no network requests
  - **Maintainability**: Centralized translation management
  - **Consistency**: Standardized text across the application
  - **Future-ready**: Easy to add new languages

### Usage

```javascript
// In Vue components
import { useTranslations } from "../composables/useTranslations.js";

const { t } = useTranslations();

// Simple translation
t("common.save"); // Returns "Save" / "Guardar" / "Sauvegarder"

// With parameters
t("events.deleteConfirmMessage", { name: "Event Name" });
```

### Language Structure

```json
{
  "en": {
    "common": { "save": "Save", "cancel": "Cancel" },
    "events": { "title": "Events Management" },
    "eventTypes": { "app": "App", "ads": "Ads" }
  }
}
```

### Adding New Languages

1. Add language code to `translations.json`
2. Translate all keys maintaining the same structure
3. Language will automatically appear in the language selector

## Testing

- Backend: Jest (unit/integration)
- Frontend: Jest & Vue Test Utils

---

## Quick Project Commands

| Action           | Command                      |
| ---------------- | ---------------------------- |
| Backend install  | `cd backend && npm install`  |
| Backend dev      | `npm run start:dev`          |
| Frontend install | `cd frontend && npm install` |
| Frontend dev     | `npm run dev`                |

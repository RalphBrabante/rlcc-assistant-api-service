# RLCC Assistant API Service

Express + Sequelize API for RLCC Assistant.

## Requirements

- Node.js 18+
- MySQL
- Redis (optional but recommended for cache)

## Install

```bash
npm install
```

## Scripts

- `npm run db:init`
  - Runs `db:create` (safe if database already exists)
  - Then runs `db:migrate`
- `npm run dev`
  - Starts API with nodemon
- `npm run dev:boot`
  - Runs `db:init` then `dev`

## Environment

Configure database and runtime values in `.env` and `src/config/config.json`.

Typical values used by docker-compose:
- `HOST=0.0.0.0`
- `PORT=3000`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `REDIS_ENABLED=true`
- `REDIS_HOST`
- `REDIS_PORT`
- `CACHE_TTL_SECONDS`
- `CORS_ALLOWED_ORIGINS`

## Local Run

```bash
npm run db:init
npm run dev
```

## Migrations / Seeders

Run migrations:

```bash
npx sequelize-cli db:migrate
```

Run seeders:

```bash
npx sequelize-cli db:seed:all
```

Current role/permission normalization seeder:
- `src/seeders/20260208000000-fix-roles-permissions-userroles.js`

## API Response Format

Success:

```json
{
  "code": 200,
  "data": {}
}
```

Error:

```json
{
  "code": 404,
  "message": "Not found"
}
```

## Group / Circle Chat Endpoints

Base: `/api/v1/groups/:id/chat/messages`

### Get Messages

`GET /api/v1/groups/:id/chat/messages?limit=30&page=1`

- Returns paginated group chat messages (newest first).

### Send Message

`POST /api/v1/groups/:id/chat/messages`

Request body:

```json
{
  "message": {
    "type": "text",
    "content": "Hello group"
  }
}
```

### Delete Message

`DELETE /api/v1/groups/:id/chat/messages/:messageId`

- Sender can delete own messages.
- Users with moderation-related group permissions can delete others' messages.

## Group Membership Enforcement

Chat access middleware:
- `src/middlewares/initGroupChatAccess.js`

Rules:
- Group members can read/send/delete own messages.
- Group owner/leader can access chat.
- Users with `read_all_groups` can access chat.

## Cache Notes

Chat list caching resource:
- `group-messages`

Cache invalidation occurs on:
- send message
- delete message

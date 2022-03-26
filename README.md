# rootvc-access
RootVC Access monorepo for AWS with multiple components

## Architecture
### Schema Definition and Migration with Prisma
Prisma, hosted on RDS Aurora (Postgres).

`/prisma`

### Workers and Jobs
Graphile workers for both scheduled and triggered jobs. Graphile uses Postgres as a durable job queue.

`/tasks`

- clearbitEnrichment.js (called by Zapier when a new email is sent or received)

### Endpoints
Express server endpoints, currently only used to interface with Zapier

`/server`

- POST /emails (called when a new email is received or sent)
- GET / (placeholder for now)

## Setup

`npm install`

`npm start`

## Future Features
- GraphQL or REST API
- Infrastructure configuration with IaSQL
- Potentially move email->job Zapier to a job using Google's Gmail APIs
- web frontend for searching the db


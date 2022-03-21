# rootvc-access
RootVC Access monorepo for AWS with multiple components

## Schema Definition and Migration with Prisma
Managed by Prisma, hosted on RDS Aurora (Postgres).
`/prisma`

## Workers and Jobs
Graphile workers for both scheduled and triggered jobs. Graphile uses Postgres as a durable job queue.
`/tasks`
- create_email (called when a new email is received or sent)

## Endpoints
Express endpoints, currently only used to interface with Zapier
`/routes`

## Future Features
- GraphQL or REST API
- Infrastructure configuration with IaSQL
- Potentially move email->job Zapier to a job using Google's Gmail APIs
- web frontend for searching the db

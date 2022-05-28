# rootvc-access
Root Access monorepo for AWS.

## About (WIP)
Root Access (usually written as RootVC Access in code, infrastructure, etc. so as not to confuse people...) is an application that works with Zapier to process all incoming emails and store relevant information in a Postgres database to be able to build a meaningful social graph for every person inside a company. This is somewhat similar to other services, but Open Source, and you know...free.

The ultimate goal of the project is to make it easy for founders in the Root Ventures portfolio to ask us for introductions for sales, hiring, etc. LinkedIN is simply not high enough fidelity to be realiable for this.

## Setup
### Service
The RootVC Access service runs in AWS and listens for incoming requests on a webhook. After we have the service running, we will setup Zapier for each user (ie: employee at a firm who wants to share their network.)

Migrate the database
`npx prisma migrate dev` for development, or `npx prisma migrate deploy` for production

Install dependencies
`npm install`

Start the servers
`npm start`

## Deploy in Production
### Dockerfile
TODO: example Dockerfile

### Environment Variables
The following environment variables must be set in the Dockerfile

(other non-secret ones)
DATABASE_URL=
CLEARBIT_API_KEY=
SUPERTOKENS_URI=
SUPERTOKENS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OWNER_GOOGLE_DOMAIN=

### Signup for Third-Party Services
Sign up for Clearbit, Supertokens, and Google App.

### Zapier
Once the service is running, each user (ie: employee at a firm who wants to share their network) needs to create a Zap to process new emails, and may optionally run a Transfer to populate legacy emails.

This part is quite easy to do, but maybe a bit hard to explain. I'm going to record a Loom for this in the future.

TODO

#### Initial setup for a domain
TODO

#### Setup per additional user
TODO

## Architecture
### Schema Definition and Migration with Prisma
Prisma, hosted on RDS Aurora (Postgres).

`/prisma`

Altering the database scheme using prisma:
1. Modify `/prisma/schema.prisma`
1. Run `npx prisma migrate dev name_your_migration`
1. Run `npx prisma deploy` to migrate the production database when ready

### Workers and Jobs
Graphile workers for both scheduled and triggered jobs. Graphile uses Postgres as a durable job queue.

`/tasks`

- clearbitEnrichment.js (called by Zapier when a new email is sent or received)

### Endpoints
Express server endpoints, currently only used to interface with Zapier

`/heartbeat`
- GET /heartbeat returns 200 OK, used to verify server is up

`/webhooks`
- POST /webhooks/emails (called when a new email is received or sent)

## Future Features
- GraphQL or REST API
- web frontend for searching the db

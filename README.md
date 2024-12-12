# Zero in a Durable Object

This runs Zero in a Cloudflare Durable Object. It's a simple example, but it
proves that it's possible to run Zero in a Durable Object.

## Running

We need 4 different terminals to run this example!

### 1. Run Posgres

Start a Postgres database using docker

```
npm run dev:db-up
```

### 2. Run Zero Cache

Start a Zero cache server

```
npm run dev:zero-cache
```

### 3. Run Web App

This is to add and remove messages to Postgres. This web app uses Zero too.

```
npm run dev:ui
```

Open a browser at http://localhost:5173 to add and remove messages.

### 4. Run Durable Object

```
npx wrangler dev
```

Open a browser at http://localhost:8787. This will create the Durable Object
which creates the Zero client in the DO.

Then make changes in the web UI and observe the console output from wrangler.

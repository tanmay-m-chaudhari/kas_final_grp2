# LogStream

Structured log ingestion and query server.

## Running Locally

```bash
cp .env.example .env
npm install
npm run dev
```

The server starts on port 7000 by default.

## Ingesting Logs

Send logs using the ingest token from your `.env`:

```bash
curl -X POST http://localhost:7000/ingest/single \
  -H "Content-Type: application/json" \
  -H "x-ingest-token: your_ingest_token_here" \
  -d '{"level":"info","message":"Server started","service":"my-app"}'
```

## Querying Logs

Obtain an admin token first:

```bash
curl -X POST http://localhost:7000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}'
```

Then query:

```bash
curl http://localhost:7000/query/logs?service=my-app \
  -H "Authorization: Bearer <token>"
```

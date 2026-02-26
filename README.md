# chroma101

This project was aimed to study how to use ChromaDB from basic local mode to cloud mode.

To install dependencies:

```bash
bun install
bun add @chroma-core/default-embed
bun add @chroma-core/openai
```

To connect to Cloud Chroma DB:

```bash
bunx chroma login
bunx chroma db connect --env-file
```

To run:

```bash
bun run index.ts
bunx chroma run # run locally -> for http://localhost:8000
bun ingest.ts # ingest policies
bun query.ts # query policies
```

Or run cloud Chroma DB directly:

```bash
bun ingest.ts # ingest policies
bun query.ts # query policies
```

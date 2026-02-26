import { OpenAIEmbeddingFunction } from "@chroma-core/openai";
import { CloudClient, ChromaClient } from "chromadb";

let chroma: CloudClient | ChromaClient;

if (process.env.CHROMA_API_KEY) {
  chroma = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
    tenant: process.env.CHROMA_TENANT,
    database: process.env.CHROMA_DATABASE,
  });
} else {
  chroma = new ChromaClient({
    host: process.env.CHROMA_HOST || "http://localhost",
    port: parseInt(process.env.CHROMA_PORT || "8000"),
  });
}

const getCollection = async (collectionName: string) => {
  const collection = await chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: new OpenAIEmbeddingFunction({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    }),
  });

  return collection;
};

console.log("Heartbeat💙💙💙: ", await chroma.heartbeat());

export { chroma, getCollection };

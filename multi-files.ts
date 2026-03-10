
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";

import { RetrievalQAChain } from "@langchain/classic/chains";
import type { Document } from "langchain";
import dotenv from "dotenv";

dotenv.config();

async function loadFiles() {
  // Step 1: Load multiple *.txt documents from file directory:
  const txtsLoader = new DirectoryLoader("./articles", {
    ".txt": (filePath: string) => new TextLoader(filePath),
  });

  const documents = await txtsLoader.load();

  if (!documents) {
    console.error("No documents found");

    return [];
  }

  const docsWithIds = documents.map((doc, index) => {
    doc.id = `pet-article-${index + 1}`;
    return doc;
  });
  // console.log("How documents look like: ", docsWithIds.length);

  return docsWithIds;
}

async function splitDocuments(documents: Document[]) {
  // Step 2: Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitDocuments(documents);
  // console.log("How chunks look like: ", JSON.stringify(chunks, null, 2));

  if (!chunks) {
    console.error("Failed to split documents into chunks ..");

    return [];
  }

  return chunks;
}

async function createVectorStore(chunks: Document[]) {
  // Step 3: Create embeddings and store in ChromaDB
  const embeddings = new OpenAIEmbeddings();

  const { ChromaClient } = await Chroma.imports();
  const chromaClient = new ChromaClient({
    host: "api.trychroma.com",
    ssl: true,
    tenant: process.env.CHROMA_TENANT,
    database: process.env.CHROMA_DATABASE,
    headers: {
      "x-chroma-token": process.env.CHROMA_API_KEY as string,
    }
  });

  const vectorStore = await Chroma.fromDocuments(
    chunks,
    embeddings,
    {
      collectionName: "pet-articles",
      index: chromaClient,
    }
  );

  console.log("Vector DB created successfully from Cloud Chroma DB");

  return vectorStore;
}

function processResponse(response: Record<string, any>) {
  console.log("\n--- Response ---");

  console.log("Answer:", response.text);

  console.log("Source Documents:", response.sourceDocuments.length);
}

async function main() {
  try {
    const documents = await loadFiles();

    const chunks = await splitDocuments(documents);

    const vectorStore = await createVectorStore(chunks);

    // Step 4: Create retriever
    const retriever = vectorStore.asRetriever({
      k: 4,
    });

    // Step 5: Create LLM
    const llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
    });

    // Step 6: Retrieval QA chain
    const qaChain = RetrievalQAChain.fromLLM(llm, retriever, {
      returnSourceDocuments: true,
    });

    // Step 7: Ask a simple question from document

    const query = "What is the balanced diet for pets?";
    const response = await qaChain.invoke({ query });

    processResponse(response);

  } catch (error) {
    console.error("Error details: ", error);
  }
}

main();

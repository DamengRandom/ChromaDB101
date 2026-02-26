import { chroma, getCollection } from "./chroma-collection";

const file = Bun.file("./policies.txt");
const text = await file.text();
const policies = text.split("\n").filter(Boolean).slice(0, 200);

const policiesCollection = await getCollection("policies");

// Clear existing items to avoid duplicates and stay under quota
try {
  const count = await policiesCollection.count();

  if (count > 0) {
    console.log(`Cleaning up ${count} existing records...`);
    await chroma.deleteCollection({ name: "policies" });
  }
} catch (e) {
  throw new Error("Failed to delete collection", { cause: e });
}

const freshCollection = await getCollection("policies");

await freshCollection.add({
  documents: policies,
  ids: policies.map((_) => crypto.randomUUID()),
  metadatas: policies.map((_, i) => ({
    line: i.toString(),
  })),
});

console.log("Policies ingested 🚀🚀🚀");
console.log(await policiesCollection.peek({}));

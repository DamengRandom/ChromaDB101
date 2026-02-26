import { getCollection } from "./chroma-collection";

const policiesCollection = await getCollection("policies");

const queryQuestions = ["Who has reignited the Cancer Moonshot?", "Who is 118th Congress speaker"];

const results = await policiesCollection.query({
  queryTexts: queryQuestions,
  nResults: 2
});

console.log("Results: ✅✅✅ ", results);

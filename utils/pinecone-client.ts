import { PineconeClient } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAI } from 'langchain/llms/openai';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';

if (
  !process.env.PINECONE_INTER_ENVIRONMENT ||
  !process.env.PINECONE_INTER_API_KEY ||
  !process.env.PINECONE_INTRA_ENVIRONMENT ||
  !process.env.PINECONE_INTRA_API_KEY
) {
  throw new Error('Pinecone environment or api key vars missing');
}

async function initIntraPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_INTRA_ENVIRONMENT ?? '',
      apiKey: process.env.PINECONE_INTRA_API_KEY ?? '',
    });

    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Intra Client');
  }
}

export const intraPinecone = await initIntraPinecone();

async function initInterPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_INTER_ENVIRONMENT ?? '',
      apiKey: process.env.PINECONE_INTER_API_KEY ?? '',
    });

    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Inter Client');
  }
}

export const interPinecone = await initInterPinecone();

export const createPineconeIndex = async (vectorDimensions: any) => {
  const indexName = process.env.PINECONE_INTRA_INDEX as string;
  const existingIndexes = await intraPinecone.listIndexes();

  if (!existingIndexes.includes(indexName)) {
    console.log(`Creating ${indexName}..`);

    await intraPinecone.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimensions,
        metric: 'cosine',
      },
    });

    console.log(`Creating index.. please wait for it to finish initializing`);
    await new Promise((resolve) => setTimeout(resolve, 60000));
  } else {
    console.log(`${indexName} already exist`);
  }
};

export const updatePinecone = async (docs: any) => {
  const pineconeIndex = intraPinecone.Index(
    process.env.PINECONE_INTRA_INDEX ?? '',
  );
  console.log(`Pinecone index retrieved: ${process.env.PINECONE_INTRA_INDEX}`);

  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}`);

    const txtPath = doc.metadata.source;
    const text = doc.pageContent;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const chunks = await textSplitter.createDocuments([text]);

    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`,
    );

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' ')),
    );

    console.log('Finished embedding documents');
    console.log(
      `Creating ${chunks.length} vectors array with id, values, and metadata...`,
    );
    const batchSize = 100;
    let batch: any = [];

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];

      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };

      batch = [...batch, vector];

      if (batch.length === batchSize || idx === chunks.length - 1) {
        await pineconeIndex.upsert({
          upsertRequest: {
            vectors: batch,
          },
        });
        batch = [];
      }

      console.log(`Pinecone index updated with ${chunks.length} vectors`);
    }

    console.log(`Finished updating vectors`);
  }
};

export const queryVectoreStoreLLM = async (question: any) => {
  console.log('Querying Pinecone vector store...');
  console.log(`Pinecone index retrieved: ${process.env.PINECONE_INTRA_INDEX}`);
  const index = intraPinecone.Index(process.env.PINECONE_INTRA_INDEX ?? '');

  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

  let queryResponse: any = await index.query({
    queryRequest: {
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    },
  });

  console.log(`Found ${queryResponse.matches.length} matches...`);

  console.log(`Asking question: ${question}...`);

  if (queryResponse.matches.length) {
    const llm = new OpenAI({});
    const chain = loadQAStuffChain(llm);

    const concatenatedPageContent = queryResponse.matches
      .map((match: any) => match.metadata.pageContent)
      .join('');

    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question,
    });

    console.log(`Answer : ${result.text}`);
    return result.text;
  } else {
    console.log('Since there are no matches, GPT-3 will not be queried.');
  }
};

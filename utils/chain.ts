import { OpenAI } from 'langchain/llms/openai';
import { interPinecone } from '@/utils/pinecone-client';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

async function initChain() {
  //initialisation of the LLM model
  const model = new OpenAI({});

  const pineconeIndex = interPinecone.Index(
    process.env.PINECONE_INTER_INDEX ?? '',
  );

  /* create vectorstore*/
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: pineconeIndex,
      textKey: 'text',
    },
  );

  return ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    { returnSourceDocuments: true },
  );
}

export const chain = await initChain();

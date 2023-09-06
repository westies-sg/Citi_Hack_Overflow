import { NextRequest, NextResponse } from 'next/server';
import { PineconeClient } from '@pinecone-database/pinecone';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

import {
  createPineconeIndex,
  updatePinecone,
} from '../../../utils/pinecone-client';

export async function POST(request: NextRequest) {
  const data = await request.formData();

  let body = Object.fromEntries(data);

  const { file } = body;

  const loader = new PDFLoader(file, {
    splitPages: false,
  });
  const docs = await loader.load();

  const vectorDimensions = 1536;

  try {
    await createPineconeIndex(vectorDimensions);
    await updatePinecone(docs);
  } catch (err) {
    console.log('error: ', err);
  }

  return NextResponse.json({
    data: 'successfully created index and loaded data into pinecone...',
  });
}

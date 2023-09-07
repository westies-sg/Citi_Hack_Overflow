import { queryVectoreStoreLLM } from '@/utils/pinecone-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question: string = body.query;
  const text = await queryVectoreStoreLLM(question);

  return NextResponse.json({
    role: 'assistant',
    content: text,
  });
}

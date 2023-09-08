import { queryVectoreStoreLLM } from "@/utils/pinecone-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const question: string = body.query;
    var text = await queryVectoreStoreLLM(question);
    if (text == "") {
        var test = "There is no information on this in our database!";
        text = test;
    }
    return NextResponse.json({
        role: "assistant",
        content: text,
    });
}

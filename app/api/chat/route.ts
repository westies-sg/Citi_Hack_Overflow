import { NextResponse } from "next/server";
import { chain } from "@/utils/chain";
import { Message } from "@/types/message";

export async function POST(request: Request) {
    console.log(Request);

    const body = await request.json();
    let translated: string = body.query;
    // Check if the question is in Chinese
    if (/[\u4e00-\u9fa5]/.test(translated)) {
        translated = "请用中文回答: " + translated;
    }
    const question = translated;
    const history: Message[] = body.history ?? [];
    console.log(question, history);
    const res = await chain.call({
        question: question,
        chat_history: history.map((h) => h.content).join("\n"),
    });

    console.log(res.sourceDocuments);

    const links: string[] = Array.from(
        new Set(
            res.sourceDocuments.map(
                (document: { metadata: { source: string } }) =>
                    document.metadata.source
            )
        )
    );
    return NextResponse.json({
        role: "assistant",
        content: res.text,
        links: links,
    });
}

"use client";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/message";
import { Send } from "react-feather";
import { UploadCloud } from "react-feather";

import LoadingDots from "@/components/LoadingDots";
import Link from "next/link";
import { RiChatSmile3Fill } from "react-icons/ri";

// import { publicChatbot } from "./public-bot/page";
//test
export default function Home() {
    const [message, setMessage] = useState<string>("");
    const [history, setHistory] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! Ask me any questions about Citibank Website.",
        },
    ]);
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const [publicBotLoading, setPublicBotLoading] = useState<boolean>(false);

    const [intraBotLoading, setIntraBotLoading] = useState<boolean>(false);

    const [isPublicChatbotOpen, setPublicChatbotOpen] = useState(true);
    const [isAdminChatbotOpen, setAdminChatbotOpen] = useState(false);

    const [intraMessage, setIntraMessage] = useState<string>("");
    const [intraHistory, setIntraHistory] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Hello! Ask me any questions about Citibank App. My knowledge base is based on uploaded PDFs.",
        },
    ]);
    const intraLastMessageRef = useRef<HTMLDivElement | null>(null);

    const togglePublicChatbot = () => {
        setPublicChatbotOpen(true);
        setAdminChatbotOpen(false);
    };

    const toggleAdminChatbot = () => {
        setPublicChatbotOpen(false);
        setAdminChatbotOpen(true);
    };

    const publicBotQuery = () => {
        if (message == "") return;
        setHistory((oldHistory) => [
            ...oldHistory,
            { role: "user", content: message },
        ]);
        setMessage("");
        setPublicBotLoading(true);
        fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message, history: history }),
        })
            .then(async (res) => {
                const r = await res.json();
                setHistory((oldHistory) => [...oldHistory, r]);
                setPublicBotLoading(false);
            })
            .catch((err) => {
                alert(err);
            });
    };

    const intraBotQuery = () => {
        if (intraMessage == "") return;
        setIntraHistory((intraHistory) => [
            ...intraHistory,
            { role: "user", content: intraMessage },
        ]);
        setIntraMessage("");
        setIntraBotLoading(true);
        fetch("/api/intra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: intraMessage,
                history: intraHistory,
            }),
        })
            .then(async (res) => {
                const r = await res.json();
                setIntraHistory((intraHistory) => [...intraHistory, r]);
                setIntraBotLoading(false);
            })
            .catch((err) => {
                alert(err);
            });
    };
    const formatPageName = (url: string) => {
        // Split the URL by "/"
        const segments = url.split("/");

        // If the last segment is empty, take the second last segment
        let pageName = segments[segments.length - 1];
        if (!pageName && segments.length > 1) {
            pageName = segments[segments.length - 2];
        }

        // Remove .html if it exists
        if (pageName.endsWith(".htm")) {
            pageName = pageName.replace(".htm", "");
        }

        // Split by "-" and then join with space
        if (pageName) {
            const formattedName = pageName.split("-").join(" ");

            // Capitalize only the first letter of the entire string
            return (
                formattedName.charAt(0).toUpperCase() + formattedName.slice(1)
            );
        }
    };

    //scroll to bottom of chat
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [history]);

    useEffect(() => {
        if (intraLastMessageRef.current) {
            intraLastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [intraHistory]);
    const [isChatOpen, setIsChatOpen] = useState(false); // New state to manage chat visibility
    //page design
    return (
        <main className=" bg-[url('/images/citibank_bg.png')] min-h-screen bg-center bg-cover bg-no-repeat ">
            <div className="absolute bottom-8 right-8 ">
                {!isChatOpen ? (
                    // Chat bubble
                    <button
                        className="focus:outline-none transition-transform transform hover:scale-110"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <img
                            src="/images/test3.png"
                            alt="Description of Image"
                            className=" object-contain"
                        ></img>
                    </button>
                ) : (
                    <div>
                        {isPublicChatbotOpen && (
                            // Chat interface
                            <div className="p-6 flex">
                                <div className="flex flex-col gap-2 w justify-center items-center flex-grow max-h-full">
                                    <div
                                        className="h-10 w-10 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center text-blue-600 hover:bg-slate-300"
                                        onClick={() => togglePublicChatbot()}
                                    >
                                        P
                                        {/* <RiChatSmile3Fill size={20} className="text-blue-600"></RiChatSmile3Fill> */}
                                    </div>
                                    <div
                                        className="h-10 w-10 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center text-blue-600 hover:bg-slate-300"
                                        onClick={() => toggleAdminChatbot()}
                                    >
                                        A
                                        {/* <RiChatSmile3Fill size={20} className="text-blue-600"></RiChatSmile3Fill> */}
                                    </div>
                                </div>

                                <div className="opacity-0 animate-fadeIn w-4/5 h-96 bg-white rounded-xl shadow-lg flex flex-col">
                                    <div className="p-4 text-center text-transparent bg-blue-600  text-white rounded-t-xl">
                                        Citibot
                                        <button
                                            className="float-right text-white"
                                            onClick={() => setIsChatOpen(false)}
                                        >
                                            X
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full ">
                                        <form
                                            className="rounded-2xl item-center justify-between border-none flex-grow flex flex-col bg-white bg-cover h-full overflow-clip w-full"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                publicBotQuery();
                                            }}
                                        >
                                            <div className="no-scrollbar overflow-y-auto flex flex-col gap-5 p-10 h-full">
                                                {history.map(
                                                    (message: Message, idx) => {
                                                        const isLastMessage =
                                                            idx ===
                                                            history.length - 1;
                                                        switch (message.role) {
                                                            case "assistant":
                                                                return (
                                                                    <div
                                                                        ref={
                                                                            isLastMessage
                                                                                ? lastMessageRef
                                                                                : null
                                                                        }
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex gap-2"
                                                                    >
                                                                        <img
                                                                            src="images/citi_bot.jpg "
                                                                            className="h-24 w-24 rounded-full "
                                                                        />
                                                                        <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                                                                            <p className="text-s font-medium text-blue-500 mb-2">
                                                                                CitiChat
                                                                                Charlie
                                                                            </p>
                                                                            {
                                                                                message.content
                                                                            }
                                                                            {message.links && (
                                                                                <div className="mt-4 flex flex-col gap-2">
                                                                                    <p className="text-xs font-medium text-slate-500">
                                                                                        For
                                                                                        more
                                                                                        detailed
                                                                                        information
                                                                                        please
                                                                                        click
                                                                                        on
                                                                                        the
                                                                                        links
                                                                                        below:
                                                                                    </p>

                                                                                    {message.links?.map(
                                                                                        (
                                                                                            link
                                                                                        ) => {
                                                                                            return (
                                                                                                <a
                                                                                                    href={
                                                                                                        link
                                                                                                    }
                                                                                                    key={
                                                                                                        link
                                                                                                    }
                                                                                                    className="block w-fit px-2 py-1 text-xs  text-blue-700 bg-blue-100 rounded"
                                                                                                >
                                                                                                    {formatPageName(
                                                                                                        link
                                                                                                    )}
                                                                                                </a>
                                                                                            );
                                                                                        }
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            case "user":
                                                                return (
                                                                    <div
                                                                        className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tl-xl text-black p-6 self-end shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                                                                        key={
                                                                            idx
                                                                        }
                                                                        ref={
                                                                            isLastMessage
                                                                                ? lastMessageRef
                                                                                : null
                                                                        }
                                                                    >
                                                                        <p className="text-s font-medium text-blue-500 mb-2">
                                                                            You
                                                                        </p>
                                                                        {
                                                                            message.content
                                                                        }
                                                                    </div>
                                                                );
                                                        }
                                                    }
                                                )}
                                                {publicBotLoading && (
                                                    <div
                                                        ref={lastMessageRef}
                                                        className="flex gap-2"
                                                    >
                                                        <img
                                                            src="images/citi_bot.jpg"
                                                            className="h-24 w-24 rounded-full border-blue"
                                                        />
                                                        <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                                                            <p className="text-sm font-medium text-blue-500 mb-4">
                                                                CitiChat Charlie
                                                            </p>
                                                            <LoadingDots />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* input area */}
                                            <div className="flex sticky bottom-0 w-full px-6 pb-6 h-24">
                                                <div className="w-full relative">
                                                    <textarea
                                                        aria-label="chat input"
                                                        value={message}
                                                        onChange={(e) =>
                                                            setMessage(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Type a message"
                                                        className="no-scrollbar w-full h-full resize-none rounded-full border border-slate-900/10 bg-white pl-6 pr-24 py-[20px] text-base placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    "Enter" &&
                                                                !e.shiftKey
                                                            ) {
                                                                e.preventDefault();
                                                                publicBotQuery();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            publicBotQuery();
                                                        }}
                                                        className="overflow-y-hidden w-14 h-14 items-center justify-center rounded-full px-3 text-sm  bg-blue-600 font-semibold text-white hover:bg-blue-700 active:bg-blue-800 absolute right-2 bottom-2 disabled:bg-blue-100 disabled:text-blue-400"
                                                        type="submit"
                                                        aria-label="Send"
                                                        disabled={
                                                            !message ||
                                                            publicBotLoading
                                                        }
                                                    >
                                                        <Send />
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAdminChatbotOpen && (
                            // Chat interface
                            <div className="p-6 flex">
                                <div className="flex flex-col gap-2 w justify-center items-center flex-grow max-h-full">
                                    <div
                                        className="h-10 w-10 rounded-full border-2 border-indigo-950 bg-white flex items-center justify-center text-indigo-950 hover:bg-slate-300"
                                        onClick={() => togglePublicChatbot()}
                                    >
                                        P
                                        {/* <RiChatSmile3Fill size={20} className="text-blue-600"></RiChatSmile3Fill> */}
                                    </div>
                                    <div
                                        className="h-10 w-10 rounded-full border-2 border-indigo-950 bg-white flex items-center justify-center text-indigo-950 hover:bg-slate-300"
                                        onClick={() => toggleAdminChatbot()}
                                    >
                                        A
                                        {/* <RiChatSmile3Fill size={20} className="text-blue-600"></RiChatSmile3Fill> */}
                                    </div>
                                </div>

                                <div className="opacity-0 animate-fadeIn w-4/5 h-96 bg-white rounded-xl shadow-lg flex flex-col">
                                    <div className="p-4 text-center text-transparent bg-indigo-950 text-white rounded-t-xl">
                                        <Link
                                            href="/upsert"
                                            className="float-left text-white"
                                        >
                                            <UploadCloud></UploadCloud>
                                        </Link>
                                        Intranet Citibot
                                        <button
                                            className="float-right text-white"
                                            onClick={() => setIsChatOpen(false)}
                                        >
                                            X
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full ">
                                        <form
                                            className="rounded-2xl item-center justify-between border-none flex-grow flex flex-col bg-white bg-cover h-full overflow-clip w-full"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                intraBotQuery();
                                            }}
                                        >
                                            <div className="no-scrollbar overflow-y-auto flex flex-col gap-5 p-10 h-full">
                                                {intraHistory.map(
                                                    (message: Message, idx) => {
                                                        const isLastMessage =
                                                            idx ===
                                                            history.length - 1;
                                                        switch (message.role) {
                                                            case "assistant":
                                                                return (
                                                                    <div
                                                                        ref={
                                                                            isLastMessage
                                                                                ? intraLastMessageRef
                                                                                : null
                                                                        }
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex gap-2"
                                                                    >
                                                                        <img
                                                                            src="images/citi_bot.jpg "
                                                                            className="h-24 w-24 rounded-full "
                                                                        />
                                                                        <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                                                                            <p className="text-s font-medium text-indigo-900 mb-2">
                                                                                Mr
                                                                                Charlie
                                                                            </p>
                                                                            {
                                                                                message.content
                                                                            }
                                                                            {message.links && (
                                                                                <div className="mt-4 flex flex-col gap-2">
                                                                                    <p className="text-xs font-medium text-slate-500">
                                                                                        For
                                                                                        more
                                                                                        detailed
                                                                                        information
                                                                                        please
                                                                                        click
                                                                                        on
                                                                                        the
                                                                                        links
                                                                                        below:
                                                                                    </p>

                                                                                    {message.links?.map(
                                                                                        (
                                                                                            link
                                                                                        ) => {
                                                                                            return (
                                                                                                <a
                                                                                                    href={
                                                                                                        link
                                                                                                    }
                                                                                                    key={
                                                                                                        link
                                                                                                    }
                                                                                                    className="block w-fit px-2 py-1 text-xs  text-indigo-900 bg-indigo-100 rounded"
                                                                                                >
                                                                                                    {formatPageName(
                                                                                                        link
                                                                                                    )}
                                                                                                </a>
                                                                                            );
                                                                                        }
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            case "user":
                                                                return (
                                                                    <div
                                                                        className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tl-xl text-black p-6 self-end shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                                                                        key={
                                                                            idx
                                                                        }
                                                                        ref={
                                                                            isLastMessage
                                                                                ? intraLastMessageRef
                                                                                : null
                                                                        }
                                                                    >
                                                                        <p className="text-s font-medium text-indigo-900 mb-2">
                                                                            You
                                                                        </p>
                                                                        {
                                                                            message.content
                                                                        }
                                                                    </div>
                                                                );
                                                        }
                                                    }
                                                )}
                                                {intraBotLoading && (
                                                    <div
                                                        ref={
                                                            intraLastMessageRef
                                                        }
                                                        className="flex gap-2"
                                                    >
                                                        <img
                                                            src="images/citi_bot.jpg"
                                                            className="h-24 w-24 rounded-full border-blue"
                                                        />
                                                        <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                                                            <p className="text-sm font-medium text-blue-500 mb-4">
                                                                Mr Charlie
                                                            </p>
                                                            <LoadingDots />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* input area */}
                                            <div className="flex sticky bottom-0 w-full px-6 pb-6 h-24">
                                                <div className="w-full relative">
                                                    <textarea
                                                        aria-label="chat input"
                                                        value={intraMessage}
                                                        onChange={(e) =>
                                                            setIntraMessage(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Type a message"
                                                        className="w-full h-full resize-none rounded-full border border-slate-900/10 bg-white pl-6 pr-24 py-[20px] text-base placeholder:text-slate-400 focus:border-indigo-950 focus:outline-none focus:ring-4 focus:ring-indigo-950/10 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    "Enter" &&
                                                                !e.shiftKey
                                                            ) {
                                                                e.preventDefault();
                                                                intraBotQuery();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            intraBotQuery();
                                                        }}
                                                        className="overflow-y-hidden w-14 h-14 items-center justify-center rounded-full px-3 text-sm  bg-indigo-950 font-semibold text-white hover:bg-indigo-950 active:bg-indigo-800 absolute right-2 bottom-2 disabled:bg-indigo-100 disabled:text-indigo-400"
                                                        type="submit"
                                                        aria-label="Send"
                                                        disabled={
                                                            !intraMessage ||
                                                            publicBotLoading
                                                        }
                                                    >
                                                        <Send />
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Minimize2 } from "lucide-react";
import { useAI } from "@/contexts/AIContext";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: number;
}

export const AITutorWidget = () => {
    const { isChatOpen, toggleChat, currentContext } = useAI();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            text: "Hello! I'm your AI Lab Assistant. I can help you understand sensors, code, and experiments. What are you working on?",
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, isChatOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Send to backend with context
            const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"}/api/ai-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.text,
                    context: currentContext,
                }),
            });

            if (!response.ok) throw new Error("Server error");

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    text: data.reply || "I'm having trouble connecting to my brain right now.",
                    timestamp: Date.now(),
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    text: "Sorry, I can't reach the server. Is it running?",
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isChatOpen) {
        return (
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/20 flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 z-50 group"
            >
                <Bot size={28} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                        <Bot size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">AI Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-400 font-medium">Online • Gemini Flash</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={toggleChat}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Minimize2 size={18} />
                </button>
            </div>

            {/* Context Badge (Optional) */}
            {currentContext.sensor && (
                <div className="px-4 py-1.5 bg-blue-500/10 border-b border-white/5 flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-400" />
                    <span className="text-xs text-blue-200">
                        Context: Viewing <strong>{currentContext.sensor}</strong>
                    </span>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        {msg.role === "assistant" && (
                            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-cyan-400" />
                            </div>
                        )}
                        <div
                            className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white/5 border border-white/5 text-slate-200 rounded-bl-none"
                                }`}
                        >
                            {msg.role === "assistant" ? (
                                <div className="chat-markdown">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                            em: ({ children }) => <em className="italic">{children}</em>,
                                            code: ({ children }) => (
                                                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-xs font-mono">
                                                    {children}
                                                </code>
                                            ),
                                            pre: ({ children }) => (
                                                <pre className="bg-slate-800/50 p-2 rounded text-xs font-mono overflow-x-auto my-2">
                                                    {children}
                                                </pre>
                                            ),
                                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-base font-bold mb-1.5">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li className="text-sm">{children}</li>,
                                            a: ({ href, children }) => (
                                                <a
                                                    href={href}
                                                    className="text-cyan-400 hover:text-cyan-300 underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-2 border-cyan-500 pl-3 italic my-2">
                                                    {children}
                                                </blockquote>
                                            ),
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <span>{msg.text}</span>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                            <Bot size={16} className="text-cyan-400" />
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-950/50">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask about this sensor..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 p-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

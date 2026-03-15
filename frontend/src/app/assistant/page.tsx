"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bot, Send, Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const suggestionPrompts = [
    "Explain how the DHT22 temperature sensor works",
    "Why is my gas sensor reading fluctuating?",
    "What causes noise in sensor data?",
    "How do I calibrate the ultrasonic sensor?",
];

export default function AssistantPage() {
    const { data } = useSocket();
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        {
            role: "assistant",
            content: "Hello! I'm your AI learning assistant. I can help you understand the sensors, explain the data you're seeing, and guide you through experiments. What would you like to learn about?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim() || isLoading) return;

        const userMsg = { role: "user" as const, content: text };
        setMessages((prev) => [...prev, userMsg]);
        if (!textOverride) setInput("");
        setIsLoading(true);

        try {
            // Map messages to Gemini history format: [{ role: "user" | "model", parts: [{ text: "..." }] }]
            const history = messages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    context: {
                        sensor: "Dashboard (Overview)",
                        dataSnippet: data?.sensors || {}
                    },
                    history: history
                })
            });

            const result = await response.json();
            
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: result.reply || "I'm sorry, I couldn't process that response." }
            ]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "I'm having trouble connecting right now. Please try again later." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">AI Learning Assistant</h1>
                    <p className="text-xs text-slate-500">Context-aware sensor education</p>
                </div>
                <Badge variant="info" size="sm" className="ml-auto">Beta</Badge>
            </div>

            {/* Chat Area */}
            <Card variant="default" className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                    ? "bg-cyan-500/20 text-white"
                                    : "bg-slate-800 text-slate-300"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                                        <span className="text-xs font-medium text-purple-400">AI Assistant</span>
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 text-slate-300 rounded-2xl px-4 py-3">
                                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                <div className="border-t border-white/5 p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs text-slate-500">Suggested questions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestionPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(prompt)}
                                disabled={isLoading}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-white/5 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading}
                            placeholder="Ask about sensors, data, or experiments..."
                            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}


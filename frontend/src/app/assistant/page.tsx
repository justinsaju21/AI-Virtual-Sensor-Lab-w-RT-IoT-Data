"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bot, Send, Sparkles, MessageCircle, Lightbulb } from "lucide-react";
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

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages((prev) => [
            ...prev,
            { role: "user", content: input },
            {
                role: "assistant",
                content: "This is a demo response. In the full version, I would analyze the current sensor data and provide contextual explanations. For example, I can see that the current temperature is " + (data?.sensors.dht11?.temp ?? "--") + "°C."
            },
        ]);
        setInput("");
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
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
                                onClick={() => setInput(prompt)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
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
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask about sensors, data, or experiments..."
                            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <button
                            onClick={handleSend}
                            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

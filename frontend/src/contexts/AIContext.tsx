"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AIContextType {
    isChatOpen: boolean;
    toggleChat: () => void;
    currentContext: {
        page: string;
        sensor?: string;
        dataSnippet?: any;
    };
    updateContext: (ctx: { page: string; sensor?: string; dataSnippet?: any }) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentContext, setCurrentContext] = useState({
        page: "dashboard",
        sensor: undefined as string | undefined,
        dataSnippet: null as any,
    });

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const updateContext = (ctx: { page: string; sensor?: string; dataSnippet?: any }) => {
        setCurrentContext((prev) => ({ ...prev, ...ctx }));
    };

    return (
        <AIContext.Provider value={{ isChatOpen, toggleChat, currentContext, updateContext }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error("useAI must be used within an AIProvider");
    }
    return context;
};

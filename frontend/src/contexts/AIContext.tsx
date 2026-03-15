"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

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

    const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), []);

    const updateContext = useCallback((ctx: { page: string; sensor?: string; dataSnippet?: any }) => {
        setCurrentContext((prev) => ({ ...prev, ...ctx }));
    }, []);

    const value = useMemo(() => ({ isChatOpen, toggleChat, currentContext, updateContext }), [isChatOpen, toggleChat, currentContext, updateContext]);

    return (
        <AIContext.Provider value={value}>
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

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TheorySection {
    title: string;
    content: string;
}

interface TheoryPanelProps {
    sections: TheorySection[];
    defaultOpen?: boolean;
}

export const TheoryPanel: React.FC<TheoryPanelProps> = ({
    sections,
    defaultOpen = false,
}) => {
    const [expandedSections, setExpandedSections] = useState<string[]>(
        defaultOpen ? sections.map((s) => s.title) : []
    );

    const toggleSection = (title: string) => {
        setExpandedSections((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title]
        );
    };

    return (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Theory & Education
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {sections.map((section) => (
                        <div
                            key={section.title}
                            className="border border-white/5 rounded-lg overflow-hidden hover:border-white/10 transition-colors"
                        >
                            {/* Header */}
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                            >
                                <h4 className="font-semibold text-sm text-slate-200">
                                    {section.title}
                                </h4>
                                {expandedSections.includes(section.title) ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>

                            {/* Content */}
                            {expandedSections.includes(section.title) && (
                                <div className="px-4 py-3 border-t border-white/5 bg-slate-900/50 text-sm text-slate-300">
                                    <div className="prose prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => (
                                                    <p className="text-slate-300 mb-2">{children}</p>
                                                ),
                                                ul: ({ children }) => (
                                                    <ul className="list-disc list-inside mb-2 space-y-1 text-slate-300">
                                                        {children}
                                                    </ul>
                                                ),
                                                li: ({ children }) => (
                                                    <li className="text-slate-300">{children}</li>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-semibold text-white">
                                                        {children}
                                                    </strong>
                                                ),
                                                em: ({ children }) => (
                                                    <em className="italic text-slate-200">
                                                        {children}
                                                    </em>
                                                ),
                                                code: ({ children }) => (
                                                    <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-cyan-300">
                                                        {children}
                                                    </code>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="font-semibold text-slate-100 mt-2 mb-1">
                                                        {children}
                                                    </h3>
                                                ),
                                            }}
                                        >
                                            {section.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

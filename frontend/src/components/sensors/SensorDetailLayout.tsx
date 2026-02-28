"use client";

import React, { useEffect, useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { useStudentNotes } from "@/hooks/useStudentNotes";
import { Activity, BookOpen, Code2, FlaskConical, AlertTriangle, FileText, Download, Check, Save, Settings } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { FaultType } from "@/hooks/useFaultInjector";
import { FilterType } from "@/hooks/useSignalProcessing";

interface TheoryContent {
    physics: string;
    math?: string;
    circuit?: string;
    protocol?: string;
}

interface ExperimentStep {
    title: string;
    instruction: string;
    observation?: string;
    expected?: string;
}

interface CommonMistake {
    title: string;
    symptom: string;
    cause: string;
    fix: string;
}

interface SensorDetailLayoutProps {
    title: string;
    description: string;
    sensorId: string;
    dataSnippet: any;
    theory: TheoryContent;
    arduinoCode?: string;
    experiments?: ExperimentStep[];
    commonMistakes?: CommonMistake[];
    children: React.ReactNode;

    // Testing Props (Optional for now to avoid breaking existing pages)
    testingProps?: {
        showPanel: boolean;
        setShowPanel: (show: boolean) => void;
        renderPanel: () => React.ReactNode;
    };
}

type TabType = "live" | "learn" | "code" | "experiment" | "mistakes";

export const SensorDetailLayout: React.FC<SensorDetailLayoutProps> = ({
    title,
    description,
    sensorId,
    dataSnippet,
    theory,
    arduinoCode,
    experiments,
    commonMistakes,
    children,
    testingProps
}) => {
    const { updateContext } = useAI();
    const [activeTab, setActiveTab] = useState<TabType>("live");
    const [activeTheoryTab, setActiveTheoryTab] = useState<"physics" | "math" | "circuit" | "protocol">("physics");
    const { notes, setNotes, isSaved } = useStudentNotes(sensorId);
    const [dynamicDocs, setDynamicDocs] = useState<any>(null);

    useEffect(() => {
        updateContext({ page: "sensor-detail", sensor: title, dataSnippet });
    }, [title, dataSnippet]);

    useEffect(() => {
        // Fetch dynamic Markdown documentation
        const fetchDocs = async () => {
            try {
                const res = await fetch(`/api/docs/${sensorId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setDynamicDocs(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load dynamic docs:", err);
            }
        };
        fetchDocs();
    }, [sensorId]);

    const activeTheory = dynamicDocs ? dynamicDocs.theory : theory;
    const activeCode = dynamicDocs ? dynamicDocs.arduinoCode : arduinoCode;

    const renderMarkdown = (content: string) => (
        <ReactMarkdown
            components={{
                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-cyan-400" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-indigo-300" {...props} />,
                p: ({ node, ...props }) => <p className="text-slate-300 mb-4 leading-relaxed" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-300" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-300" {...props} />,
                li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                em: ({ node, ...props }) => <em className="italic text-slate-400" {...props} />,
                code: ({ node, inline, ...props }: any) =>
                    inline
                        ? <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                        : <pre className="bg-slate-900 p-4 rounded-xl border border-white/10 overflow-x-auto my-4 text-sm font-mono leading-relaxed"><code className="text-slate-300" {...props} /></pre>,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 py-1 my-4 bg-cyan-500/5 rounded-r" {...props} />,
                table: ({ node, ...props }) => <table className="w-full text-left border-collapse my-4 text-sm text-slate-300 border border-white/10 rounded-lg overflow-hidden" {...props} />,
                thead: ({ node, ...props }) => <thead className="bg-white/5 border-b border-white/10 text-white font-medium" {...props} />,
                th: ({ node, ...props }) => <th className="p-3 font-semibold" {...props} />,
                td: ({ node, ...props }) => <td className="p-3 border-b border-white/5 last:border-0" {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    );

    const tabs = [
        { id: "live" as TabType, label: "Live Data", icon: <Activity size={16} /> },
        { id: "learn" as TabType, label: "Learn", icon: <BookOpen size={16} /> },
        { id: "code" as TabType, label: "Code", icon: <Code2 size={16} /> },
        { id: "experiment" as TabType, label: "Experiment", icon: <FlaskConical size={16} /> },
        { id: "mistakes" as TabType, label: "Mistakes", icon: <AlertTriangle size={16} /> },
    ];

    const theoryTabs = [
        { id: "physics", label: "Physics", content: activeTheory?.physics },
        { id: "math", label: "Math", content: activeTheory?.math },
        { id: "circuit", label: "Circuit", content: activeTheory?.circuit },
        { id: "protocol", label: "Protocol", content: activeTheory?.protocol },
    ].filter(t => t.content);

    const escapeHtml = (str: string): string => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    const exportPDF = () => {
        const safeTitle = escapeHtml(title);
        const safeSensorId = escapeHtml(sensorId);
        const safeDescription = escapeHtml(description);
        const safePhysics = escapeHtml(theory.physics);
        const safeNotes = escapeHtml(notes || "(No notes recorded)");
        const safeData = escapeHtml(JSON.stringify(dataSnippet, null, 2));

        const printContent = `
            <html>
            <head>
                <title>${safeTitle} - Lab Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                    h1 { border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
                    h2 { color: #0ea5e9; margin-top: 30px; }
                    .meta { color: #666; font-size: 14px; }
                    .notes { background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
                    .theory { background: #f0f9ff; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h1>${safeTitle}</h1>
                <p class="meta">Sensor ID: ${safeSensorId} | Generated: ${new Date().toLocaleString()}</p>
                <p>${safeDescription}</p>
                
                <h2>Theory: Physics</h2>
                <div class="theory">${safePhysics}</div>
                
                <h2>My Observations</h2>
                <div class="notes">${safeNotes}</div>
                
                <h2>Current Reading</h2>
                <pre>${safeData}</pre>
            </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono text-slate-400 border border-white/5">{sensorId}</span>
                        {testingProps && (
                            <button
                                onClick={() => testingProps.setShowPanel(!testingProps.showPanel)}
                                className={`ml-3 px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1 ${testingProps.showPanel ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                            >
                                <Settings size={12} />
                                {testingProps.showPanel ? "Hide Testing Controls" : "Enable Testing Mode"}
                            </button>
                        )}
                    </div>
                    <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition">
                        <FileText size={14} />
                        Export Report
                    </button>
                </div>
                <p className="text-slate-400 text-sm max-w-2xl">{dynamicDocs?.description || description}</p>
            </div>

            {/* Top-Level Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/30"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {/* LIVE DATA TAB */}
                {activeTab === "live" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Testing Panel (If Enabled) */}
                        {testingProps?.showPanel && (
                            <div className="animate-in slide-in-from-top-4 duration-300">
                                {testingProps.renderPanel()}
                            </div>
                        )}

                        {children}

                        {/* Student Notes Section */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    My Observations
                                </h3>
                                <span className={`text-xs flex items-center gap-1 ${isSaved ? "text-emerald-400" : "text-amber-400"}`}>
                                    {isSaved ? <Check size={12} /> : <Save size={12} />}
                                    {isSaved ? "Saved" : "Saving..."}
                                </span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Write your observations here... (Auto-saved)"
                                className="w-full h-32 p-3 rounded-lg bg-slate-900 border border-white/10 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                )}

                {/* LEARN TAB */}
                {activeTab === "learn" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex gap-2 flex-wrap">
                            {theoryTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTheoryTab(tab.id as typeof activeTheoryTab)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTheoryTab === tab.id
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                        : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            {dynamicDocs ? renderMarkdown(theoryTabs.find(t => t.id === activeTheoryTab)?.content || "") : (
                                <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                                    {theoryTabs.find(t => t.id === activeTheoryTab)?.content}
                                </pre>
                            )}
                        </div>
                    </div>
                )}

                {/* CODE TAB */}
                {activeTab === "code" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Arduino Code</h3>
                            <span className="text-xs text-slate-500">Read-only • Educational</span>
                        </div>
                        <div className="relative rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/5">
                                <span className="text-xs font-mono text-slate-400">{sensorId.toLowerCase().replace(/\s+/g, "_")}.ino</span>
                                <Code2 size={14} className="text-slate-500" />
                            </div>
                            <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto">
                                <code>{activeCode || `// Code coming soon...`}</code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* EXPERIMENT TAB */}
                {activeTab === "experiment" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FlaskConical className="text-emerald-400" size={20} />
                            Guided Experiment
                        </h3>
                        {dynamicDocs?.experimentsRaw ? (
                            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                {renderMarkdown(dynamicDocs.experimentsRaw)}
                            </div>
                        ) : experiments && experiments.length > 0 ? (
                            <div className="space-y-4">
                                {experiments.map((step, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white">{step.title}</h4>
                                                <p className="text-sm text-slate-400">{step.instruction}</p>
                                                {step.observation && (
                                                    <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                        <p className="text-xs font-medium text-blue-400 mb-1">🔍 What do you observe?</p>
                                                        <p className="text-sm text-slate-300">{step.observation}</p>
                                                    </div>
                                                )}
                                                {step.expected && (
                                                    <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                        <p className="text-xs font-medium text-emerald-400 mb-1">✓ Expected</p>
                                                        <p className="text-sm text-slate-300">{step.expected}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                                <p className="text-slate-500">Experiments coming soon.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* MISTAKES TAB */}
                {activeTab === "mistakes" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="text-amber-400" size={20} />
                            Common Mistakes & Troubleshooting
                        </h3>
                        {dynamicDocs?.mistakesRaw ? (
                            <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                {renderMarkdown(dynamicDocs.mistakesRaw)}
                            </div>
                        ) : commonMistakes && commonMistakes.length > 0 ? (
                            <div className="space-y-4">
                                {commonMistakes.map((mistake, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                        <h4 className="font-semibold text-amber-400 mb-2">{mistake.title}</h4>
                                        <div className="grid gap-2 text-sm">
                                            <div><span className="text-slate-500">Symptom:</span> <span className="text-slate-300">{mistake.symptom}</span></div>
                                            <div><span className="text-slate-500">Cause:</span> <span className="text-slate-300">{mistake.cause}</span></div>
                                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                                <span className="text-emerald-400 font-medium">Fix: </span>
                                                <span className="text-slate-300">{mistake.fix}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <MistakeCard title="No Readings (0 or NaN)" symptom="Sensor shows 0 or 'NaN' constantly" cause="Disconnected wire or wrong pin assignment" fix="Check VCC, GND, and signal wire connections. Verify pin number in code matches wiring." />
                                <MistakeCard title="Erratic/Noisy Readings" symptom="Values jumping randomly even in stable conditions" cause="Electrical interference, long wires, or poor power supply" fix="Use shorter wires, add 0.1µF capacitor near sensor, ensure stable 5V power." />
                                <MistakeCard title="Readings Stuck" symptom="Same value repeating despite environmental changes" cause="Sensor not initialized or damaged" fix="Check if sensor library is included. Try a different sensor to rule out hardware failure." />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const MistakeCard = ({ title, symptom, cause, fix }: { title: string; symptom: string; cause: string; fix: string }) => (
    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="font-semibold text-amber-400 mb-2">{title}</h4>
        <div className="grid gap-2 text-sm">
            <div><span className="text-slate-500">Symptom:</span> <span className="text-slate-300">{symptom}</span></div>
            <div><span className="text-slate-500">Cause:</span> <span className="text-slate-300">{cause}</span></div>
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-medium">Fix: </span><span className="text-slate-300">{fix}</span>
            </div>
        </div>
    </div>
);

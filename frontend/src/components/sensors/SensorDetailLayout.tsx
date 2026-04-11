"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { useStudentNotes } from "@/hooks/useStudentNotes";
import { Activity, BookOpen, Code2, FlaskConical, AlertTriangle, FileText, Check, Save, Settings, Download } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import Script from 'next/script';

// Dedicated Mermaid diagram component — uses mermaid.render() (imperative API)
// wrapped in React.memo to prevent flickering during high-frequency parent re-renders.
const MermaidDiagram: React.FC<{ chart: string }> = React.memo(({ chart }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        let cancelled = false;
        const render = async () => {
            // Poll until mermaid CDN script has finished loading
            let attempts = 0;
            while (typeof window !== 'undefined' && !(window as any).mermaid && attempts < 30) {
                await new Promise(r => setTimeout(r, 150));
                attempts++;
            }
            if (cancelled || !(window as any).mermaid || !divRef.current) return;
            try {
                const { svg } = await (window as any).mermaid.render(idRef.current, chart.trim());
                if (!cancelled && divRef.current) {
                    divRef.current.innerHTML = svg;
                    divRef.current.style.opacity = '1';
                }
            } catch (e) {
                console.warn('[Mermaid render error]', e);
                // Fallback: show raw code block
                if (!cancelled && divRef.current) {
                    divRef.current.innerHTML = `<pre style="color:#94a3b8;font-size:13px;white-space:pre-wrap">${chart}</pre>`;
                    divRef.current.style.opacity = '1';
                }
            }
        };
        render();
        return () => { cancelled = true; };
    }, [chart]);

    return (
        <div
            ref={divRef}
            style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            className="flex justify-center my-6 bg-white/5 p-4 rounded-xl border border-white/10 overflow-x-auto min-h-[80px]"
        />
    );
});

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
    }, [title, JSON.stringify(dataSnippet)]);

    useEffect(() => {
        // Fetch dynamic Markdown documentation
        const fetchDocs = async () => {
            try {
                const res = await fetch(`/api/docs/${sensorId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setDynamicDocs(data);
                        // Only auto-select physics if the current selected tab has NO content in the new data
                        // This prevents "glitching" back to physics if the user already clicked a tab while loading.
                        const currentHasContent = data.theory?.[activeTheoryTab] || theory?.[activeTheoryTab];
                        if (!currentHasContent) {
                            setActiveTheoryTab('physics');
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load dynamic docs:", err);
            }
        };
        fetchDocs();
    }, [sensorId]);

    // Merge: static theory is the base, dynamic docs from MD override specific keys.
    // This preserves the 'math' tab (static-only) even after dynamic docs load.
    const activeTheory = {
        ...theory,
        ...(dynamicDocs?.theory || {}),
        // Only override a key if the dynamic value is non-empty
        physics: (dynamicDocs?.theory?.physics) || theory?.physics,
        math: theory?.math, // math is always from the static page props
        circuit: (dynamicDocs?.theory?.circuit) || theory?.circuit,
        protocol: (dynamicDocs?.theory?.protocol) || theory?.protocol,
    };
    // Fall back to static arduinoCode if dynamic parsing returned null
    const activeCode = dynamicDocs?.arduinoCode || arduinoCode;

    const renderMarkdown = (content: string | null | undefined) => {
        if (!content) return <p className="text-slate-500 italic">No content available.</p>;
        return (
            <div className="mermaid-container animate-in fade-in duration-500">
                <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-cyan-400" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-indigo-300" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-md font-semibold mt-3 mb-1 text-slate-200" {...props} />,
                        h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mt-2 mb-1 text-slate-300" {...props} />,
                        p: ({ node, ...props }) => <div className="text-slate-300 mb-4 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-300" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-300" {...props} />,
                        li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                        em: ({ node, ...props }) => <em className="italic text-slate-400" {...props} />,
                        code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isMermaid = match && match[1] === 'mermaid';
                            
                            if (isMermaid) {
                                return <MermaidDiagram chart={String(children)} />;
                            }
                            
                            return inline
                                ? <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                                : <pre className="bg-slate-900 p-4 rounded-xl border border-white/10 overflow-x-auto my-4 text-sm font-mono leading-relaxed"><code className="text-slate-300" {...props}>{children}</code></pre>
                        },
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 py-1 my-4 bg-cyan-500/5 rounded-r" {...props} />,
                        table: ({ node, ...props }) => <table className="w-full text-left border-collapse my-4 text-sm text-slate-300 border border-white/10 rounded-lg overflow-hidden" {...props} />,
                        thead: ({ node, ...props }) => <thead className="bg-white/5 border-b border-white/10 text-white font-medium" {...props} />,
                        th: ({ node, ...props }) => <th className="p-3 font-semibold" {...props} />,
                        td: ({ node, ...props }) => <td className="p-3 border-b border-white/5 last:border-0" {...props} />,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    // MermaidDiagram components handle their own rendering imperatively — no global re-scan needed.

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

    // Optimized: Only re-render markdown content when theory changes, 
    // NOT when live dataSnippet updates (which happens at 5Hz).
    const memoizedTheoryContent = React.useMemo(() => {
        const tab = theoryTabs.find(t => t.id === activeTheoryTab);
        return renderMarkdown(tab?.content || "");
    }, [activeTheoryTab, JSON.stringify(activeTheory), dynamicDocs]);

    const memoizedExperimentContent = React.useMemo(() => {
        if (dynamicDocs?.experimentsRaw) return renderMarkdown(dynamicDocs.experimentsRaw);
        return null;
    }, [dynamicDocs?.experimentsRaw]);

    const memoizedMistakesContent = React.useMemo(() => {
        if (dynamicDocs?.mistakesRaw) return renderMarkdown(dynamicDocs.mistakesRaw);
        return null;
    }, [dynamicDocs?.mistakesRaw]);

    const escapeHtml = (str: string): string => {
        if (!str) return "";
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    /**
     * Simple regex-based markdown-to-HTML converter specifically for the print report.
     * Ensures characters like **bold** and *italics* render correctly in the PDF.
     */
    const renderMarkdownForPrint = (text: string, domSvgs?: string[]): string => {
        if (!text) return "";

        // Normalize line endings
        let raw = text.replace(/\r\n/g, '\n');

        // === STEP 0: Extract mermaid blocks BEFORE any HTML escaping ===
        // Mermaid syntax (-->, [text], etc.) must not be HTML-escaped.
        // We replace each mermaid block with a unique placeholder and resolve later.
        const mermaidPlaceholders: string[] = [];
        raw = raw.replace(/```mermaid\s*([\s\S]*?)```/g, (_match: string, diagram: string) => {
            const ph = `@@@MERMAIDPH:${mermaidPlaceholders.length}@@@`;
            mermaidPlaceholders.push(diagram.trim());
            return ph + '\n';
        });

        // === STEP 1: HTML-escape the remaining text ===
        let html = raw
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // === STEP 2: Extract markdown tables and replace with placeholders ===
        const tablePlaceholders: string[] = [];
        html = html.replace(/((?:\|.+\|[ \t]*\n)+)/g, (tableBlock) => {
            const lines = tableBlock.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
            const dataLines = lines.filter((l: string) => !/^\|[\s:\-|]+\|$/.test(l));
            if (dataLines.length === 0) return tableBlock;

            const [headerLine, ...bodyLines] = dataLines;

            const parseRow = (line: string, isHeader: boolean) => {
                const cells = line.replace(/^\||\|$/g, '').split('|').map((c: string) => c.trim());
                const cellTag = isHeader ? 'th' : 'td';
                const cellStyle = isHeader
                    ? 'border:1px solid #94a3b8;padding:8px 12px;background:#e2e8f0;font-weight:bold;text-align:left;color:#1e293b;'
                    : 'border:1px solid #cbd5e1;padding:8px 12px;background:#fff;text-align:left;color:#334155;';
                return `<tr>${cells.map((c: string) => `<${cellTag} style="${cellStyle}">${c}</${cellTag}>`).join('')}</tr>`;
            };

            const thead = `<thead>${parseRow(headerLine, true)}</thead>`;
            const tbody = bodyLines.length > 0
                ? `<tbody>${bodyLines.map((l: string) => parseRow(l, false)).join('')}</tbody>`
                : '';
            const tableHtml = `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:11pt;">${thead}${tbody}</table>`;
            const placeholder = `<!--TBLPH:${tablePlaceholders.length}-->`;
            tablePlaceholders.push(tableHtml);
            return placeholder + '\n';
        });

        // === STEP 3: Apply remaining markdown formatting ===
        // Headers
        html = html.replace(/^#### (.*$)/gm, '<br/><b style="color:#0369a1;font-size:1em;font-style:italic;">$1</b><br/>');
        html = html.replace(/^### (.*$)/gm, '<br/><b style="color:#0284c7;font-size:1.1em;">$1</b><br/>');
        html = html.replace(/^## (.*$)/gm, '<br/><b style="color:#0f172a;font-size:1.2em;border-bottom:1px solid #ddd;">$1</b><br/>');

        // Generic code blocks (non-mermaid)
        html = html.replace(/```[\w]*\s*([\s\S]*?)```/g, '<pre style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:12px;font-family:monospace;font-size:10pt;white-space:pre-wrap;">$1</pre>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;"/>');

        // Bold & Italics
        html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        html = html.replace(/__(.*?)__/g, '<b>$1</b>');
        html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
        html = html.replace(/_(.*?)_/g, '<i>$1</i>');

        // Inline Code
        html = html.replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 4px;border-radius:3px;font-family:monospace;font-size:0.9em;">$1</code>');

        // Bullet points
        html = html.replace(/^\s*[-*]\s+(.*)/gm, '<div style="margin-left:20px;display:list-item;list-style-type:disc;">$1</div>');

        // Newlines (AFTER tables and mermaid have been extracted)
        html = html.replace(/\n\n/g, '</p><p style="margin-top:10px;">');
        html = html.replace(/\n/g, '<br/>');

        // === STEP 4: Restore table placeholders ===
        tablePlaceholders.forEach((tableHtml: string, i: number) => {
            html = html.replace(`<!--TBLPH:${i}-->`, tableHtml);
        });

        // === STEP 5: Restore mermaid placeholders ===
        // We inject the unescaped raw mermaid code directly into a placeholder div
        // The embedded Mermaid.js script in the print HTML will dynamically render these.
        mermaidPlaceholders.forEach((diagram: string, i: number) => {
            const svgHtml = `<div class="mermaid" style="text-align:center;margin:16px 0;padding:12px;display:flex;justify-content:center;">\n${diagram}\n</div>`;
            html = html.replace(`@@@MERMAIDPH:${i}@@@`, svgHtml);
        });

        return `<div style="word-wrap:break-word;">${html}</div>`;
    };

    const exportPDF = () => {
        const safeTitle = escapeHtml(title);
        const safeSensorId = escapeHtml(sensorId);
        const safeDescription = escapeHtml(description || dynamicDocs?.description || "");
        const safeNotes = escapeHtml(notes || "(No notes recorded)");
        const safeData = escapeHtml(JSON.stringify(dataSnippet, null, 2));

        // 1. Gather All Text Content
        const theorySections = theoryTabs.map(t => 
            `<h3>${escapeHtml(t.label)}</h3><div class="theory-box">${renderMarkdownForPrint(t.content || "")}</div>`
        ).join('');

        const codeSection = activeCode ? 
            `<div class="code-box"><pre><code>${escapeHtml(activeCode)}</code></pre></div>` : 
            `<p class="meta">No code available.</p>`;

        const experimentsHtml = (experiments && experiments.length > 0) ? experiments.map((step, i) => `
            <div class="list-item">
                <strong>Step ${i + 1}: ${escapeHtml(step.title)}</strong><br/>
                <em>Instruction:</em> ${renderMarkdownForPrint(step.instruction)}<br/>
                ${step.observation ? `<em>Observe:</em> ${renderMarkdownForPrint(step.observation)}<br/>` : ''}
                ${step.expected ? `<em>Expected:</em> <span style="color:#059669">${renderMarkdownForPrint(step.expected)}</span>` : ''}
            </div>
        `).join('') : '<p class="meta">No experiments available.</p>';

        const mistakesHtml = (commonMistakes && commonMistakes.length > 0) ? commonMistakes.map(m => `
            <div class="list-item">
                <strong style="color:#d97706;">${escapeHtml(m.title)}</strong><br/>
                <em>Symptom:</em> ${renderMarkdownForPrint(m.symptom)}<br/>
                <em>Cause:</em> ${renderMarkdownForPrint(m.cause)}<br/>
                <em>Fix:</em> <span style="color:#059669">${renderMarkdownForPrint(m.fix)}</span>
            </div>
        `).join('') : '<p class="meta">No recorded common mistakes.</p>';

        const svgs = Array.from(document.querySelectorAll('.recharts-wrapper')).map(el => el.outerHTML).join('<br/><hr/><br/>');
        const aiExplainer = document.querySelector('.prose')?.innerHTML || '';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${safeTitle} - Comprehensive Lab Report</title>
                <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"><\/script>
                <script>document.addEventListener('DOMContentLoaded', function() { if(window.mermaid) { window.mermaid.initialize({ startOnLoad: true, theme: 'default' }); window.mermaid.run(); } });<\/script>
                <style>

                    @page { margin: 2cm; size: A4; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0px; color: #222; width: 100%; margin: 0 auto; line-height: 1.6; }
                    h1 { border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; margin-bottom: 5px; color: #0f172a; font-size: 24pt; }
                    h2 { border-bottom: 2px solid #cbd5e1; color: #0284c7; margin-top: 30px; padding-bottom: 5px; font-size: 18pt; page-break-after: avoid; }
                    h3 { color: #334155; margin-top: 20px; font-size: 14pt; }
                    .meta { color: #64748b; font-size: 10pt; font-style: italic; margin-bottom: 20px; }
                    .theory-box { background: #f8fafc; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 4px; font-size: 11pt; margin-bottom: 15px; page-break-inside: auto; }
                    .code-box { background: #0f172a; color: #e2e8f0; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 10pt; font-family: 'Consolas', 'Courier New', monospace; overflow: hidden; page-break-inside: avoid; }
                    .notes-box { background: #fefce8; padding: 15px; border: 1px solid #fef08a; border-radius: 8px; font-size: 11pt; margin: 20px 0; page-break-inside: avoid; }
                    .list-item { background: #f1f5f9; padding: 12px; margin-bottom: 10px; border-radius: 6px; font-size: 11pt; border-left: 3px solid #94a3b8; page-break-inside: avoid; }
                    .graph-container { background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 15px; text-align: center; page-break-inside: avoid; }
                    .ai-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-left: 4px solid #8b5cf6; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 11pt; page-break-inside: avoid; }
                    .recharts-wrapper { background: #0f172a; padding: 10px; border-radius: 8px; max-width: 100% !important; height: auto !important; display: block; margin: auto; }
                    .recharts-text, .recharts-cartesian-axis-tick-value { fill: #fff !important; font-size: 10px; }
                    svg { max-width: 100% !important; height: auto !important; }
                    
                    /* Page Break Management */
                    .page-break { page-break-before: always; }
                    
                    @media print {
                        body { width: 100%; border:0; margin:0; padding:0; }
                        .recharts-wrapper { background: #fff; border: 1px solid #ccc; }
                        .recharts-text, .recharts-cartesian-axis-tick-value { fill: #000 !important; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${safeTitle}</h1>
                <p class="meta">Sensor ID: <strong>${safeSensorId}</strong> | Report Generated: ${new Date().toLocaleString()}</p>
                <p style="font-size: 16px;">${safeDescription}</p>
                
                <div class="notes-box">
                    <strong>Student Observations:</strong><br/><br/>
                    ${safeNotes}
                </div>

                ${aiExplainer ? `
                <div class="ai-box">
                    <strong style="color: #6d28d9;">✨ AI Context / Analysis:</strong><br/><br/>
                    ${aiExplainer}
                </div>
                ` : ''}

                <h2>1. Live Sensor Data Capture</h2>
                <div class="active-data" style="background:#f1f5f9; padding: 10px; border-radius: 6px;">
                    <pre style="margin:0; font-weight:bold; font-size:14px; color:#0f172a;">${safeData}</pre>
                </div>

                ${svgs ? `
                <h3>Real-Time Signal Graphs</h3>
                <div class="graph-container">
                    ${svgs}
                </div>
                ` : '<p class="meta">No live charts active in view.</p>'}

                <div class="page-break"></div>

                <h2>2. Theoretical Foundation</h2>
                ${theorySections}

                <div class="page-break"></div>

                <h2>3. Guided Experiments</h2>
                ${experimentsHtml}

                <h2>4. Common Pitfalls & Troubleshooting</h2>
                ${mistakesHtml}

                <div class="page-break"></div>

                <h2>5. Reference Arduino Implementation</h2>
                ${codeSection}

            </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            // Allow SVG rendering time
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    const exportCSV = () => {
        // Build CSV from dataSnippet keys
        const rows: string[][] = [];
        rows.push(["Field", "Value", "ExportedAt"]);
        const ts = new Date().toISOString();
        const flatten = (obj: any, prefix = "") => {
            Object.entries(obj || {}).forEach(([k, v]) => {
                if (typeof v === "object" && v !== null) flatten(v, prefix ? `${prefix}.${k}` : k);
                else rows.push([prefix ? `${prefix}.${k}` : k, String(v), ts]);
            });
        };
        flatten(dataSnippet);
        const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sensorId}_data_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
                integrity="sha384-G79zG0V+4YORJWmSDws9S9qx9ASvgH6t6v34qD+M/fG5/RUp867tS6/5zj5S9j9J"
                crossOrigin="anonymous"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if (typeof window !== 'undefined' && (window as any).mermaid) {
                        (window as any).mermaid.initialize({
                            startOnLoad: false, // We use imperative rendering via MermaidDiagram component
                            theme: 'dark',
                            themeVariables: {
                                darkMode: true,
                                primaryColor: '#0ea5e9',
                                primaryTextColor: '#fff',
                                primaryBorderColor: '#0ea5e9',
                                lineColor: '#38bdf8',
                                secondaryColor: '#1e293b',
                                tertiaryColor: '#0f172a'
                            }
                        });
                    }
                }}
            />
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
                    <div className="flex items-center gap-2">
                        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition">
                            <Download size={14} />
                            CSV
                        </button>
                        <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition">
                            <FileText size={14} />
                            Export Report
                        </button>
                    </div>
                </div>
                <div className="text-slate-400 text-sm max-w-2xl">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-slate-200" {...props} />,
                            hr: ({ node, ...props }) => <hr className="border-t border-white/10 my-3" {...props} />
                        }}
                    >
                        {dynamicDocs?.description || description || ""}
                    </ReactMarkdown>
                </div>
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
                            {memoizedTheoryContent}
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
                        {memoizedExperimentContent ? (
                            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                {memoizedExperimentContent}
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
                        {memoizedMistakesContent ? (
                            <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                {memoizedMistakesContent}
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

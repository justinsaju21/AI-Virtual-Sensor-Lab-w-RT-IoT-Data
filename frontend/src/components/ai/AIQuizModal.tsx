"use client";

import React, { useState } from "react";
import { Sparkles, X, CheckCircle, XCircle, Loader2, Brain } from "lucide-react";

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface AIQuizModalProps {
    sensorName: string;
    sensorId: string;
    onClose: () => void;
    defaultQuestions?: Question[];
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({ sensorName, sensorId, onClose, defaultQuestions }) => {
    const [questions, setQuestions] = useState<Question[]>(defaultQuestions || []);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(!defaultQuestions || defaultQuestions.length === 0);
    const [error, setError] = useState<string | null>(null);
    const [aiExtrasLoading, setAiExtrasLoading] = useState(false);
    const [hasLoadedAiExtras, setHasLoadedAiExtras] = useState(false);

    // Generate quiz on mount ONLY if no defaults provided
    React.useEffect(() => {
        if (!defaultQuestions || defaultQuestions.length === 0) {
            generateQuiz();
        }
    }, []);

    const generateQuiz = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"}/api/ai-quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sensorName, sensorId }),
            });

            if (!response.ok) throw new Error("Failed to generate quiz");

            const data = await response.json();
            if (!data.questions || data.questions.length === 0) throw new Error("No questions");
            setQuestions(data.questions);
            setLoading(false);
        } catch (err) {
            setError("Could not generate quiz. Using fallback questions.");
            setQuestions([
                {
                    question: `What physical principle does the ${sensorName} use?`,
                    options: ["Photoelectric effect", "Piezoelectric effect", "Electromagnetic induction", "Depends on sensor type"],
                    correctIndex: 3,
                    explanation: "Different sensors use different physical principles based on what they measure."
                },
                {
                    question: "Why might sensor readings fluctuate even when conditions are stable?",
                    options: ["Sensor is broken", "ADC noise and environmental micro-changes", "Wrong wiring", "Software bug"],
                    correctIndex: 1,
                    explanation: "All sensors have some noise due to ADC quantization and minor environmental changes."
                },
                {
                    question: "What does a 10-bit ADC give you?",
                    options: ["10 possible values", "100 possible values", "1024 possible values", "10,000 possible values"],
                    correctIndex: 2,
                    explanation: "A 10-bit ADC provides 2^10 = 1024 discrete values (0-1023)."
                }
            ]);
            setLoading(false);
        }
    };

    const loadAiExtras = async () => {
        try {
            setAiExtrasLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"}/api/ai-quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sensorName, sensorId }),
            });
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            if (data.questions && data.questions.length > 0) {
                setQuestions(prev => [...prev, ...data.questions]);
                setHasLoadedAiExtras(true);
            }
        } catch (err) {
            setError("AI is temporarily unavailable. Try again later.");
        } finally {
            setAiExtrasLoading(false);
        }
    };

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        if (index === questions[currentQ].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelectedAnswer(null);
        } else {
            setShowResult(true);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 text-center">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Generating quiz questions...</p>
                </div>
            </div>
        );
    }

    if (showResult) {
        const pct = Math.round((score / questions.length) * 100);
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 text-center">
                    <div className={`h-20 w-20 mx-auto mb-4 rounded-full flex items-center justify-center ${pct >= 70 ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                        <span className="text-4xl font-bold text-white">{score}/{questions.length}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {pct === 100 ? "Perfect! 🎉" : pct >= 70 ? "Good job! 👍" : "Keep learning! 📚"}
                    </h3>
                    <p className="text-slate-400 mb-6">You answered {score} out of {questions.length} questions correctly ({pct}%).</p>
                    <div className="flex gap-3 justify-center">
                        {!hasLoadedAiExtras && (
                            <button
                                onClick={() => { setShowResult(false); loadAiExtras(); }}
                                disabled={aiExtrasLoading}
                                className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-2"
                            >
                                <Brain size={16} />
                                {aiExtrasLoading ? "Loading..." : "More AI Questions"}
                            </button>
                        )}
                        <button onClick={onClose} className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        <span className="text-sm text-slate-400">Question {currentQ + 1} of {questions.length}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">{q.question}</h3>

                <div className="space-y-2 mb-4">
                    {q.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={selectedAnswer !== null}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedAnswer === null
                                    ? "border-white/10 hover:border-cyan-500/50 hover:bg-white/5"
                                    : i === q.correctIndex
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : selectedAnswer === i
                                            ? "border-red-500 bg-red-500/10"
                                            : "border-white/5 opacity-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {selectedAnswer !== null && i === q.correctIndex && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                                {selectedAnswer === i && i !== q.correctIndex && <XCircle className="h-5 w-5 text-red-400" />}
                                <span className="text-white">{opt}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {selectedAnswer !== null && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                        <p className="text-sm text-blue-300">{q.explanation}</p>
                    </div>
                )}

                {selectedAnswer !== null && (
                    <button onClick={nextQuestion} className="w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
                        {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
                    </button>
                )}
            </div>
        </div>
    );
};

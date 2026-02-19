"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap, BookOpen, Video, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

const topics = [
    {
        title: "Introduction to IoT",
        description: "Learn the fundamentals of Internet of Things and sensor networks.",
        lessons: 5,
        duration: "45 min",
    },
    {
        title: "Sensor Types & Working",
        description: "Understand different sensor types: analog, digital, and their applications.",
        lessons: 8,
        duration: "1.5 hrs",
    },
    {
        title: "Arduino Programming Basics",
        description: "Get started with Arduino programming for sensor interfacing.",
        lessons: 10,
        duration: "2 hrs",
    },
    {
        title: "Data Processing & Filtering",
        description: "Learn techniques to handle sensor noise and process data effectively.",
        lessons: 6,
        duration: "1 hr",
    },
];

export default function LearnPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Learning Center</h1>
                    <Badge variant="info" size="md">Coming Soon</Badge>
                </div>
                <p className="text-slate-500">Master IoT and embedded systems concepts</p>
            </div>

            {/* Topics Grid */}
            <div className="grid gap-4">
                {topics.map((topic, idx) => (
                    <Card key={idx} variant="gradient" className="group cursor-pointer">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white mb-1">{topic.title}</h3>
                                    <p className="text-sm text-slate-400 truncate">{topic.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span>{topic.lessons} lessons</span>
                                        <span>•</span>
                                        <span>{topic.duration}</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Resources */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card variant="default">
                    <CardContent className="p-5 text-center">
                        <Video className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-white mb-1">Video Tutorials</h3>
                        <p className="text-xs text-slate-500">Step-by-step video guides</p>
                    </CardContent>
                </Card>
                <Card variant="default">
                    <CardContent className="p-5 text-center">
                        <FileText className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                        <h3 className="font-semibold text-white mb-1">Documentation</h3>
                        <p className="text-xs text-slate-500">Detailed sensor datasheets</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

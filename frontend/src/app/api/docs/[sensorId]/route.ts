import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Map sensor IDs the frontend passes to the actual markdown filenames
const idToFileMap: Record<string, string> = {
    "HC-SR04": "HC-SR04.md",
    "DHT11": "DHT11.md",
    "DHT22": "DHT11.md", // Use DHT11 doc for DHT22 for now
    "BMP180": "BMP280.md",
    "BMP280": "BMP280.md",
    "KY-038": "Sound.md",
    "Flame": "Flame.md",
    "IR": "IR.md",
    "E18-D80NK": "Proximity.md",
    "LDR": "LDR.md",
    "TTP223": "Touch.md",
    "SW-520D": "Tilt.md",
    "HC-SR501": "PIR.md",
    "A3144": "Hall.md",
    "Joystick": "Joystick.md",
    "MQ2": "MQ2.md",
    "MQ-2": "MQ2.md",
    "MQ3": "MQ3.md",
    "MQ-3": "MQ3.md",
    "MAX30102": "MAX30102.md",
    "LM35": "Temperature.md"
};

// Sanitize sensor ID to prevent path traversal
function sanitizeSensorId(id: string): string {
    // Strip any path separators and navigation characters
    return id.replace(/[\/\\\.]+/g, '').replace(/\.\./g, '');
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sensorId: string }> }
) {
    try {
        const { sensorId: rawSensorId } = await params;
        let sensorId = sanitizeSensorId(rawSensorId).toUpperCase();

        if (!sensorId) {
            return NextResponse.json({ error: "Invalid sensor ID" }, { status: 400 });
        }

        // Look for file mapping, or fallback to exact match
        const filename = idToFileMap[sensorId] || `${sensorId}.md`;

        const docsDir = path.join(process.cwd(), '..', 'documentation', 'sensors');

        let filePath = path.join(docsDir, filename);

        // Verify the resolved path stays within the docs directory (defense in depth)
        const resolvedPath = path.resolve(filePath);
        const resolvedDocsDir = path.resolve(docsDir);
        if (!resolvedPath.startsWith(resolvedDocsDir)) {
            return NextResponse.json({ error: "Invalid sensor ID" }, { status: 400 });
        }

        try {
            await fs.access(filePath);
        } catch {
            // Try finding generically
            const files = await fs.readdir(docsDir);
            const found = files.find(f => f.toLowerCase().includes(sensorId.toLowerCase()));
            if (found) {
                filePath = path.join(docsDir, found);
                // Re-verify resolved path
                const resolvedFound = path.resolve(filePath);
                if (!resolvedFound.startsWith(resolvedDocsDir)) {
                    return NextResponse.json({ error: "Invalid sensor ID" }, { status: 400 });
                }
            } else {
                return NextResponse.json({ error: "Documentation not found" }, { status: 404 });
            }
        }

        const content = await fs.readFile(filePath, 'utf8');

        // Parse the markdown into chunks for the UI tabs

        const extractSection = (regex: RegExp) => {
            const match = content.match(regex);
            return match ? match[1].trim() : null;
        };

        // 1. Description
        const description = extractSection(/## 1\. Description\n([\s\S]*?)(?=## 2)/);

        // 2. Theory & Physics
        const physics = extractSection(/## 2\. Theory & Physics\n([\s\S]*?)(?=## 3)/);

        // 3. Protocol & 4. Wiring -> Merged into 'circuit' or 'protocol' for the UI
        const protocol = extractSection(/## 3\. Communication Protocol.*?\n([\s\S]*?)(?=## 4)/);
        const wiring = extractSection(/## 4\. Hardware Wiring.*?\n([\s\S]*?)(?=## 5)/);

        // 5. Code
        const codeMatch = content.match(/## 5\. Arduino Implementation Code[\s\S]*?```(cpp|c)\n([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[2].trim() : null;

        // 6. Experiments (Raw Markdown)
        const experimentsRaw = extractSection(/## 6\. Physical Experiments\n([\s\S]*?)(?=## 7)/);

        // 7. Mistakes (Raw Markdown)
        const mistakesRaw = extractSection(/## 7\. Common Mistakes & Troubleshooting\n([\s\S]*?)(?=## Required|## AI|## 8|$)/);

        return NextResponse.json({
            success: true,
            description,
            theory: {
                physics,
                protocol,
                circuit: wiring
            },
            arduinoCode: code,
            experimentsRaw,
            mistakesRaw
        });

    } catch (error) {
        console.error("Error reading documentation:", error);
        return NextResponse.json({ error: "Failed to read documentation" }, { status: 500 });
    }
}

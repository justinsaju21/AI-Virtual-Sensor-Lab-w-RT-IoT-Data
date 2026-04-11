import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Map sensor IDs the frontend passes to the actual markdown filenames
const idToFileMap: Record<string, string> = {
    // Ultrasonic
    "HC-SR04": "HC-SR04.md",
    "hcsr04": "HC-SR04.md",
    // Temperature / Humidity
    "DHT11": "DHT11.md",
    "dht11": "DHT11.md",
    "DHT22": "DHT11.md",
    "dht22": "DHT11.md",
    // Pressure
    "BMP280": "BMP280.md",
    "bmp280": "BMP280.md",
    "BMP180": "BMP280.md",
    "bmp180": "BMP280.md",
    // Sound
    "KY-038": "Sound.md",
    "sound": "Sound.md",
    // Flame
    "Flame": "Flame.md",
    "flame": "Flame.md",
    "KY-026": "Flame.md",
    // IR
    "IR": "IR.md",
    "ir": "IR.md",
    "TCRT5000 / KY-032": "IR.md",
    "KY-032": "IR.md",
    "TCRT5000": "IR.md",
    // Inductive Proximity
    "E18-D80NK": "Proximity.md",
    "proximity": "Proximity.md",
    // LDR / Light
    "LDR": "LDR.md",
    "ldr": "LDR.md",
    "LDR / CdS Cell": "LDR.md",
    "LDR / CdS cell": "LDR.md",
    "light": "LDR.md",
    // Touch
    "TTP223": "Touch.md",
    "touch": "Touch.md",
    // Tilt
    "SW-520D": "Tilt.md",
    "tilt": "Tilt.md",
    // PIR / Motion
    "HC-SR501": "PIR.md",
    "PIR": "PIR.md",
    "pir": "PIR.md",
    "motion": "PIR.md",
    // Hall
    "A3144": "Hall.md",
    "A3144 / KY-003": "Hall.md",
    "hall": "Hall.md",
    // Joystick
    "Joystick": "Joystick.md",
    "joystick": "Joystick.md",
    "KY-023": "Joystick.md",
    // Gas / MQ
    "MQ2": "MQ2.md",
    "mq2": "MQ2.md",
    "MQ-2": "MQ2.md",
    "gas": "MQ2.md",
    "MQ3": "MQ3.md",
    "mq3": "MQ3.md",
    "MQ-3": "MQ3.md",
    "alcohol": "MQ3.md",
    // Heart Rate / Oximeter
    "MAX30102": "MAX30102.md",
    "max30102": "MAX30102.md",
    "heartbeat": "MAX30102.md",
    "Pulse": "MAX30102.md",
    // Temperature (LM35)
    "LM35": "Temperature.md",
    "lm35": "Temperature.md",
    "temperature": "Temperature.md",
    // Thermistor
    "thermistor": "Thermistor.md",
    "NTC": "Thermistor.md",
    "ntc": "Thermistor.md",
    "humidity": "DHT11.md",
};

// Resolve a sensorId to a filename — tries raw ID first (preserving composites like "A3144 / KY-003"),
// then uppercase, then case-insensitive scan.
function resolveFilename(rawId: string, sanitizedId: string): string {
    return (
        idToFileMap[rawId] ||
        idToFileMap[rawId.toUpperCase()] ||
        Object.entries(idToFileMap).find(([k]) => k.toLowerCase() === rawId.toLowerCase())?.[1] ||
        idToFileMap[sanitizedId] ||
        idToFileMap[sanitizedId.toUpperCase()] ||
        Object.entries(idToFileMap).find(([k]) => k.toLowerCase() === sanitizedId.toLowerCase())?.[1] ||
        `${sanitizedId}.md`
    );
}

// Sanitize sensor ID to prevent path traversal
function sanitizeSensorId(id: string): string {
    return id.replace(/[\\/\.]+/g, '').replace(/\.\./g, '');
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sensorId: string }> }
) {
    try {
        const { sensorId: rawSensorId } = await params;
        const sanitizedId = sanitizeSensorId(rawSensorId);

        if (!sanitizedId && !rawSensorId) {
            return NextResponse.json({ error: "Invalid sensor ID" }, { status: 400 });
        }

        const filename = resolveFilename(rawSensorId, sanitizedId);

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
            const found = files.find(f => f.toLowerCase().includes(rawSensorId.toLowerCase()) || f.toLowerCase().includes(sanitizedId.toLowerCase()));
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
        const description = extractSection(/## 1\. Description\s*[\r\n]+([\s\S]*?)(?=## 2|$)/);

        // 2. Theory & Physics
        const physics = extractSection(/## 2\. Theory & Physics\s*[\r\n]+([\s\S]*?)(?=## 3|$)/);

        // 3. Protocol & 4. Wiring -> Merged into 'circuit' or 'protocol' for the UI
        const protocol = extractSection(/## 3\. Communication Protocol.*?\s*[\r\n]+([\s\S]*?)(?=## 4|$)/);
        const wiring = extractSection(/## 4\. Hardware Wiring.*?\s*[\r\n]+([\s\S]*?)(?=## 5|$)/);

        // 5. Code
        const codeMatch = content.match(/## 5\. Arduino Implementation Code.*?\s*[\r\n]+[\s\S]*?```(cpp|c|ino)?\s*[\r\n]+([\s\S]*?)```/);
        const code = codeMatch ? codeMatch[2].trim() : null;

        // 6. Experiments (Raw Markdown)
        const experimentsRaw = extractSection(/## 6\. Physical Experiments\s*[\r\n]+([\s\S]*?)(?=## 7|$)/);

        // 7. Mistakes (Raw Markdown)
        const mistakesRaw = extractSection(/## 7\. Common Mistakes & Troubleshooting\s*[\r\n]+([\s\S]*?)(?=## Required|## AI|## 8|$)/);

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

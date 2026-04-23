require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateMockData } = require('./mockDataGenerator');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini (graceful — server still starts without a key)
let model = null;
if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  console.log('[AI] Gemini 2.5 Flash initialized successfully.');
} else {
  console.warn('[AI] WARNING: GEMINI_API_KEY not set. AI endpoints will return fallback responses.');
}

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// ============ HYBRID MODE CONFIG ============
// Specify which sensors should use real data when available.
// All other sensors will use animated mock data.
const REAL_SENSORS = [
  "ultrasonic", "dht11", "mq2", "mq3", "ldr",
  "bmp280", "flame", "sound", "pir", "ir",
  "touch", "tilt", "hall",
  "joystick", "thermistor", "max30102"
];

const mergeHardwareWithMock = (mock, real) => {
  if (!real) return mock;
  const merged = JSON.parse(JSON.stringify(mock)); // Deep clone
  
  REAL_SENSORS.forEach(sensorKey => {
    if (real[sensorKey]) {
      merged.sensors[sensorKey] = { 
        ...merged.sensors[sensorKey], 
        ...real[sensorKey],
        isReal: true // Flag to show it's hardware data
      };
    }
  });
  
  return merged;
};

let lastHardwareSensors = null;
let latestReading = null;
let useRealData = false;
let lastRealDataTime = 0;
const REAL_DATA_TIMEOUT = 30000; // 30 seconds stale timeout

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    mode: 'hybrid',
    realSensors: REAL_SENSORS,
    lastUpdate: latestReading?.timestamp || null
  });
});

// Receive sensor data from hardware (ESP8266)
app.post('/api/sensor-data', (req, res) => {
  try {
    const data = req.body;

    // Guard: reject if body is null/empty (can happen with HTTP Keep-Alive reuse)
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Empty or invalid request body' });
    }

    console.log(`[DEBUG] Incoming POST /api/sensor-data. Keys: ${Object.keys(data).join(', ')}`);
    
    if (!data.device_id || !data.sensors) {
      console.warn(`[DEBUG] Validation failed! device_id: ${!!data.device_id}, sensors: ${!!data.sensors}`);
      return res.status(400).json({ error: 'Invalid data format' });
    }

    lastHardwareSensors = data.sensors;
    useRealData = true;
    lastRealDataTime = Date.now();

    console.log(`[HYBRID] Real data received from ${data.device_id}. Will merge on next tick.`);
    res.json({ success: true, message: 'Data received and queued for merge' });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle between mock and real data
app.post('/api/mode', (req, res) => {
  try {
    const { mode } = req.body || {};
    if (mode === 'mock') {
      useRealData = false;
      res.json({ mode: 'mock', message: 'Switched to mock data' });
    } else if (mode === 'hardware') {
      useRealData = true;
      res.json({ mode: 'hardware', message: 'Waiting for hardware data' });
    } else {
      res.status(400).json({ error: 'Invalid mode. Use "mock" or "hardware"' });
    }
  } catch (error) {
    console.error('Error in /api/mode:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Chat Endpoint (Live Gemini Integration)
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message, context, history } = req.body || {};
    console.log("Gemini AI Query:", message, "with context:", context?.sensor);

    if (!model) {
      return res.json({ reply: `I see you're looking at the **${context?.sensor || 'dashboard'}**. The AI key is not configured on the server yet. Please add GEMINI_API_KEY as an environment variable on Render.` });
    }

    const systemPrompt = `You are an expert IoT Virtual Lab Assistant. 
    The student is currently viewing: ${context?.sensor || "the dashboard"}.
    Live Data Snippet: ${JSON.stringify(context?.dataSnippet || {})}.
    
    Answer the student's question accurately. Focus on the physics, electronics, and coding aspects of the sensor. Be concise but educational. Keep your answer to under 150 words. Use Markdown for formatting.`;

    const chat = model.startChat({
        history: history || [],
        generationConfig: { maxOutputTokens: 1000 }
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nStudent: ${message}`);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.json({ reply: "I'm having trouble connecting to my Gemini brain. Check if the API key is valid!" });
  }
});


// Helper to parse markdown files for quiz questions
function parseQuizFromMarkdown(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');

    const quizSectionMatch = content.match(/## AI Assessment Questions[^]*?(?=(?:## )|$)/i);
    if (!quizSectionMatch) return null;

    const quizText = quizSectionMatch[0];
    const questions = [];

    // Split by **Q1:, **Q2:, etc.
    const qBlocks = quizText.split(/\*\*(Q\d+:.*?)\*\*/g).filter(Boolean);

    // qBlocks will have pairs: [ "Q1: Question text", "\n- A) ...\n- B) ... \n", "Q2... " ]
    for (let i = 0; i < qBlocks.length; i += 2) {
      if (!qBlocks[i].startsWith('Q')) continue;

      const qText = qBlocks[i].replace(/Q\d+:\s*/, '').trim();
      const optionsRaw = qBlocks[i + 1];

      const options = [];
      let correctIndex = 0;
      let foundCorrect = false;

      const optionLines = optionsRaw.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
      optionLines.forEach((ol, idx) => {
        let optText = ol.replace(/^-\s*[A-D]\)\s*/, '').trim();
        if (optText.includes('*(Correct)*')) {
          correctIndex = idx;
          foundCorrect = true;
          optText = optText.replace('*(Correct)*', '').trim();
        }
        options.push(optText);
      });

      if (options.length > 0) {
        if (!foundCorrect) {
          console.warn(`No correct answer marker found for question: "${qText}"`);
        }
        questions.push({
          question: qText,
          options,
          correctIndex,
          explanation: "Reviewed from documentation physics."
        });
      }
    }

    return questions.length > 0 ? questions : null;
  } catch (err) {
    console.error(`Error parsing quiz from ${filePath}:`, err);
    return null;
  }
}

// Map sensor names/IDs to markdown filenames
const sensorFileMap = {
  // Primary IDs (used by frontend sensorId prop)
  "hc-sr04": "HC-SR04.md",
  "ultrasonic": "HC-SR04.md",
  "dht11": "DHT11.md",
  "bmp280": "BMP280.md",
  "mq2": "MQ2.md",
  "mq3": "MQ3.md",
  "pir": "PIR.md",
  "motion": "PIR.md",
  "ldr": "LDR.md",
  "light": "LDR.md",
  "hall": "Hall.md",
  "flame": "Flame.md",
  "ir": "IR.md",
  "joystick": "Joystick.md",
  "max30102": "MAX30102.md",
  "heartbeat": "MAX30102.md",
  "thermistor": "Thermistor.md",
  "tilt": "Tilt.md",
  "touch": "Touch.md",
  "sound": "Sound.md",
  "proximity": "Proximity.md",

  // Human Names (fallback for AI context)
  "Ultrasonic Sensor": "HC-SR04.md",
  "Temperature Sensor": "DHT11.md",
  "Pressure Sensor": "BMP280.md",
  "Sound Sensor": "Sound.md",
  "Flame Sensor": "Flame.md",
  "IR Sensor": "IR.md",
  "Proximity Sensor": "Proximity.md",
  "LDR Sensor": "LDR.md",
  "Touch Sensor": "Touch.md",
  "Tilt Sensor": "Tilt.md",
  "Motion Sensor": "PIR.md",
  "PIR Sensor": "PIR.md",
  "Hall Sensor": "Hall.md",
  "Magnetic Sensor": "Hall.md",
  "Gas Sensor (MQ-2)": "MQ2.md",
  "Gas Sensor": "MQ2.md",
  "Alcohol Sensor": "MQ3.md",
  "Thermistor": "Thermistor.md",
  "Temperature": "Temperature.md",
  "Heart Rate Sensor": "MAX30102.md",
  "Pulse Oximeter": "MAX30102.md"
};

// AI Quiz Generation Endpoint (Live Gemini Integration)
app.post("/api/ai-quiz", async (req, res) => {
  try {
    const { sensorName, sensorId } = req.body || {};
    console.log("Gemini generating quiz for:", sensorName);

    if (!model) {
      return res.json({ questions: [
        { question: "What is the primary function of this sensor?", options: ["To heat up", "To detect environmental changes", "To store data", "To emit light"], correctIndex: 1, explanation: "Sensors detect changes and output signals." }
      ] });
    }

    // Solid Technique 1: Provide actual documentation context to prevent hallucinations
    let docContext = "";
    const filename = sensorFileMap[sensorName] || `${sensorId}.md`;
    const filePath = path.join(__dirname, '..', 'documentation', 'sensors', filename);
    
    // First, try to just parse the static questions if the user isn't asking for "more"
    // Since the frontend just hits this endpoint, we'll randomize whether we use static or dynamic
    // to give them fresh ones when they click "More AI Questions".
    // Alternatively, always prefer dynamic AI since the endpoint is literally /api/ai-quiz.
    
    if (fs.existsSync(filePath)) {
        docContext = fs.readFileSync(filePath, 'utf8');
    }

    // Solid Technique 2: Use Native JSON mode responseMimeType to guarantee parsable JSON
    const prompt = `You are an expert engineering tutor. Generate a 3-question multiple choice quiz for a university student about the ${sensorName} (ID: ${sensorId}).
    Use the following documentation to ensure your questions are highly accurate and relevant to the curriculum:
    ---
    ${docContext.substring(0, 3000)} // trim to avoid token limits just in case
    ---
    Return the response ONLY as a JSON object in this exact format, with 4 options per question:
    {
      "questions": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0,
          "explanation": "Detailed explanation of why this is correct based on the documentation."
        }
      ]
    }`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const response = await result.response;
    const text = response.text();
    
    // No regex cleanup needed due to responseMimeType
    const questions = JSON.parse(text).questions;

    res.json({ questions });
  } catch (error) {
    console.error('Gemini Quiz Error:', error);
    // Fallback if AI fails
    res.json({ 
        questions: [
            { question: "What is the primary function of this sensor?", options: ["To heat up", "To detect environmental changes", "To store data", "To emit light"], correctIndex: 1, explanation: "Sensors detect changes and output signals." }
        ] 
    });
  }
});


// AI Graph Explanation Endpoint (Live Gemini Integration)
app.post("/api/ai-explain", async (req, res) => {
  try {
    const { sensorName, data } = req.body || {};
    console.log("Gemini explaining graph for:", sensorName);

    if (!model) {
      return res.json({ explanation: "AI analysis requires GEMINI_API_KEY. Please set it in your Render environment variables." });
    }

    if (!data || !Array.isArray(data) || data.length < 3) {
      return res.json({ explanation: "Not enough data points for Gemini to analyze." });
    }

    const dataSummary = data.map(d => `${d.time}: ${d.value}`).join(", ");
    const prompt = `Analyze this sensor data for a ${sensorName} graph: ${dataSummary}.
    Explain what's happening physically. Is it stable? Are there any significant spikes or drops?
    What might cause these changes in a real lab setting? 
    Use Markdown and bullet points. Be technical but clear.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();

    res.json({ explanation });
  } catch (error) {
    console.error('Gemini Explain Error:', error);
    res.json({ explanation: "AI analysis failed. Please check the raw data below." });
  }
});


// ============ MOCK DATA LOOP ============
// Runs at 200ms (5Hz) to match firmware TX_INTERVAL = 200ms
// This syncs backend emission with hardware push rate for ~200ms end-to-end latency

setInterval(() => {
  try {
  const now = Date.now();

  // If using real data but it's been too long, clear the hardware cache
  if (useRealData && (now - lastRealDataTime > REAL_DATA_TIMEOUT)) {
    console.log('[HYBRID] Hardware data stale, reverting to pure mock');
    useRealData = false;
    lastHardwareSensors = null;
  }

  // ALWAYS generate mock data to keep the 'other' sensors moving
  const mock = generateMockData();

  // Merge in real data for REAL_SENSORS if available
  latestReading = mergeHardwareWithMock(mock, lastHardwareSensors);
  latestReading.timestamp = new Date().toISOString();
  latestReading.is_hybrid = true;

  io.emit('data_stream', latestReading);

  } catch (err) {
    console.error('[CRITICAL] Error in data loop:', err);
  }
}, 200); // 200ms = 5Hz — matches firmware TX_INTERVAL

// ============ SOCKET.IO ============

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send mode info
  socket.emit('mode', {
    mode: useRealData ? 'hardware' : 'mock',
    connected: true
  });

  // Send latest data immediately
  if (latestReading) {
    socket.emit('data_stream', latestReading);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('====================================');
  console.log(`IoT Virtual Lab Backend`);
  console.log(`Running on port ${PORT}`);
  console.log(`Mode: ${useRealData ? 'Hardware' : 'Mock Data'}`);
  console.log('====================================');
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /              - Health check`);
  console.log(`  POST /api/sensor-data - Receive hardware data`);
  console.log(`  POST /api/mode      - Switch mock/hardware mode`);
  console.log(`  POST /api/ai-chat   - AI Assistant chat`);
  console.log(`  POST /api/ai-quiz   - AI Quiz generation`);
  console.log(`  POST /api/ai-explain - AI Graph explanation`);
  console.log('');
});

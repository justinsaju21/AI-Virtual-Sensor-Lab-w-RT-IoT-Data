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
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  console.log('[AI] Gemini 1.5 Flash initialized successfully.');
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
    console.log(`[DEBUG] Incoming POST /api/sensor-data. Keys: ${Object.keys(data).join(', ')}`);
    
    if (!data.device_id || !data.sensors) {
      console.warn(`[DEBUG] Validation failed! device_id present: ${!!data.device_id}, sensors present: ${!!data.sensors}`);
      return res.status(400).json({ error: 'Invalid data format' });
    }

    lastHardwareSensors = data.sensors;
    useRealData = true;
    lastRealDataTime = Date.now();

    // Store hardware data; the setInterval loop handles all emissions
    // at a consistent 2-second cadence to prevent duplicate/bursty updates

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
    const { message, context } = req.body || {};
    console.log("Gemini AI Query:", message, "with context:", context?.sensor);

    if (!model) {
      return res.json({ reply: `I see you're looking at the **${context?.sensor || 'dashboard'}**. The AI key is not configured on the server yet. Please add GEMINI_API_KEY as an environment variable on Render.` });
    }

    const systemPrompt = `You are an expert IoT Virtual Lab Assistant. 
    The student is currently viewing: ${context?.sensor || "the dashboard"}.
    Live Data Snippet: ${JSON.stringify(context?.dataSnippet || {})}.
    
    Answer the student's question accurately. Focus on the physics, electronics, and coding aspects of the sensor. Be concise but educational. Use Markdown for formatting.`;

    const chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 500 }
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

      const optionLines = optionsRaw.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
      optionLines.forEach((ol, idx) => {
        let optText = ol.replace(/^-\s*[A-D]\)\s*/, '').trim();
        if (optText.includes('*(Correct)*')) {
          correctIndex = idx;
          optText = optText.replace('*(Correct)*', '').trim();
        }
        options.push(optText);
      });

      if (options.length > 0) {
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

// Map sensor names to markdown filenames
const sensorFileMap = {
  "Ultrasonic Sensor": "HC-SR04.md",
  "Temperature Sensor": "DHT11.md", // Or LM35, we'll default to DHT11 for now
  "Pressure Sensor": "BMP280.md",
  "Sound Sensor": "Sound.md",
  "Flame Sensor": "Flame.md",
  "IR Sensor": "IR.md",
  "Proximity Sensor": "Proximity.md", // or IR for E18-D80NK, but Proximity.md has inductive
  "LDR Sensor": "LDR.md",
  "Light Sensor": "LDR.md",
  "Touch Sensor": "Touch.md",
  "Tilt Sensor": "Tilt.md",
  "Motion Sensor": "PIR.md",
  "PIR Sensor": "PIR.md",
  "Hall Sensor": "Hall.md",
  "Magnetic Sensor": "Hall.md",
  "Joystick": "Joystick.md",
  "Gas Sensor (MQ-2)": "MQ2.md",
  "Alcohol Sensor": "MQ3.md",
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

    const prompt = `Generate a 3-question multiple choice quiz for an engineering student about the ${sensorName} (ID: ${sensorId}).
    Return the response ONLY as a JSON object in this exact format:
    {
      "questions": [
        {
          "question": "text",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correctIndex": 0,
          "explanation": "why it's correct"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown code blocks from response
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(jsonStr).questions;

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

// Generate mock data and merge with hardware readings
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

  if (useRealData) {
    console.log('[HYBRID] Emitted merged payload (Real + Mock)');
  }
  } catch (err) {
    console.error('[CRITICAL] Error in data loop:', err);
  }
}, 2000);

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

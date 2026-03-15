require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateMockData } = require('./mockDataGenerator');

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
  "proximity", "touch", "tilt", "hall", 
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

    // Create hybrid payload and emit immediately for responsiveness
    const mock = generateMockData();
    latestReading = mergeHardwareWithMock(mock, lastHardwareSensors);
    latestReading.timestamp = new Date().toISOString();
    latestReading.device_id = data.device_id;

    io.emit('data_stream', latestReading);

    console.log(`[HYBRID] Real data received from ${data.device_id}. Merging with mocks.`);
    res.json({ success: true, message: 'Data merged and emitted' });
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

// AI Chat Endpoint (Mock for Gemini)
app.post("/api/ai-chat", (req, res) => {
  try {
    const { message, context } = req.body || {};
    console.log("AI Query:", message, "Context:", context);

    let reply = "I'm still learning, but here's what I know about sensors!";

    if (context && context.sensor) {
      reply = `I see you're looking at the **${context.sensor}**. \n\nBased on your current data, everything looks normal. Would you like to know how the ${context.sensor} physically measures data?`;
    } else if (message && message.toLowerCase().includes("sensor")) {
      reply = "Sensors are devices that detect events or changes in the environment and send the information to other electronics, frequently a computer processor.";
    } else {
      reply = "I'm your AI Assistant. I can explain code, sensor physics, or help debug your experiments!";
    }

    setTimeout(() => {
      res.json({ reply });
    }, 1000);
  } catch (error) {
    console.error('Error in /api/ai-chat:', error);
    res.status(500).json({ error: 'Server error' });
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

// AI Quiz Generation Endpoint
app.post("/api/ai-quiz", (req, res) => {
  try {
    const { sensorName, sensorId } = req.body || {};
    console.log("Generating quiz for:", sensorName, "ID:", sensorId);

  let questions = null;
  const docsDir = path.join(__dirname, '..', 'documentation', 'sensors');

  // Try to find a matching file
  let mappedFilename = sensorFileMap[sensorName];

  // Try to match by sensorId
  if (!mappedFilename && sensorId) {
    if (sensorId.includes('DHT')) mappedFilename = 'DHT11.md';
    else if (sensorId.includes('HC-SR04')) mappedFilename = 'HC-SR04.md';
    else if (sensorId.includes('HC-SR501')) mappedFilename = 'PIR.md';
    else if (sensorId.includes('BMP')) mappedFilename = 'BMP280.md';
    else if (sensorId.includes('MQ2') || sensorId.includes('MQ-2')) mappedFilename = 'MQ2.md';
    else if (sensorId.includes('MQ3') || sensorId.includes('MQ-3')) mappedFilename = 'MQ3.md';
    else if (sensorId.includes('TTP223')) mappedFilename = 'Touch.md';
    else if (sensorId.includes('SW-520D')) mappedFilename = 'Tilt.md';
    else if (sensorId.includes('KEYES') || sensorId.includes('KY-038')) mappedFilename = 'Sound.md';
    else if (sensorId.includes('E18-D80NK')) mappedFilename = 'IR.md';
    // generic fallback logic
    else {
      const files = fs.readdirSync(docsDir);
      for (const file of files) {
        if (file.toLowerCase().includes(sensorId.toLowerCase()) ||
          sensorName.toLowerCase().includes(file.replace('.md', '').toLowerCase())) {
          mappedFilename = file;
          break;
        }
      }
    }
  }

  if (mappedFilename) {
    const filePath = path.join(docsDir, mappedFilename);
    const parsed = parseQuizFromMarkdown(filePath);
    if (parsed) questions = parsed;
  }

  // Fallback if none found
  if (!questions) {
    console.log("No specific quiz found, using default fallback.");
    questions = [
      { question: "What is the primary function of this sensor?", options: ["To heat up", "To detect environmental changes", "To store data", "To emit light"], correctIndex: 1, explanation: "Sensors detect changes and output signals." },
      { question: "Why is calibration important?", options: ["Makes them faster", "Corrects manufacturing variations", "Reduces power consumption", "Changes the sensing range"], correctIndex: 1, explanation: "Calibration offsets errors." },
      { question: "What causes electrical noise in readings?", options: ["Too much light", "Electromagnetic interference", "High temperature", "Low humidity"], correctIndex: 1, explanation: "EMI from nearby electronics causes noise." }
    ];
  }

  setTimeout(() => {
    res.json({ questions });
  }, 500);
  } catch (error) {
    console.error('Error in /api/ai-quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Graph Explanation Endpoint
app.post("/api/ai-explain", (req, res) => {
  try {
    const { sensorName, data } = req.body || {};
    console.log("Explaining graph for:", sensorName, "with", data?.length, "points");

    if (!data || !Array.isArray(data) || data.length < 3) {
      return res.json({ explanation: "Not enough data points to analyze. Collect more readings." });
    }

    const values = data.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = values.reduce((a, b) => a < b ? a : b, values[0]);
    const max = values.reduce((a, b) => a > b ? a : b, values[0]);
  const range = max - min;
  const trend = values[values.length - 1] - values[0];

  let explanation = `## ${sensorName} Analysis\n\n`;
  explanation += `**Statistics:**\n`;
  explanation += `- Average: ${avg.toFixed(2)}\n`;
  explanation += `- Min: ${min.toFixed(2)} | Max: ${max.toFixed(2)}\n`;
  explanation += `- Range: ${range.toFixed(2)}\n`;
  explanation += `- Trend: ${trend > 2 ? "📈 Rising" : trend < -2 ? "📉 Falling" : "➡️ Stable"}\n\n`;

  if (range > avg * 0.3) {
    explanation += `**⚠️ High Variability Detected**\n`;
    explanation += `The readings show significant fluctuation. Possible causes:\n`;
    explanation += `- Environmental changes (doors, AC, people)\n`;
    explanation += `- Sensor noise or loose connections\n`;
    explanation += `- Power supply instability\n`;
  } else if (range < avg * 0.05) {
    explanation += `**✅ Very Stable Readings**\n`;
    explanation += `The sensor is producing consistent values, indicating:\n`;
    explanation += `- Stable environmental conditions\n`;
    explanation += `- Good sensor connection and calibration\n`;
  } else {
    explanation += `**ℹ️ Normal Variation**\n`;
    explanation += `The readings show expected minor fluctuations typical of real-world sensors.\n`;
  }

  setTimeout(() => {
    res.json({ explanation });
  }, 800);
  } catch (error) {
    console.error('Error in /api/ai-explain:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ MOCK DATA LOOP ============

// Generate mock data and merge with hardware readings
setInterval(() => {
  const now = Date.now();

  // If using real data but it's been too long, clear the hardware cache
  if (useRealData && (now - lastRealDataTime > REAL_DATA_TIMEOUT)) {
    console.log('[HYBRID] Hardware data stale, reverting to pure mock');
    useRealData = false;
    lastHardwareSensors = null;
  }

  // ALWAYS generate mock data to keep the 'other' sensors moving
  const mock = generateMockData();
  
  // Merge in real data for the 4 specific sensors if available
  latestReading = mergeHardwareWithMock(mock, lastHardwareSensors);
  latestReading.timestamp = new Date().toISOString();
  latestReading.is_hybrid = true;

  io.emit('data_stream', latestReading);
  
  if (useRealData) {
    console.log('[HYBRID] Emitted merged payload (Real + Mock)');
  } else {
    // console.log('[MOCK] Emitted pure mock data');
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

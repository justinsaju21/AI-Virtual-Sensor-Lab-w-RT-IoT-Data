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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store latest reading
let latestReading = null;
let useRealData = false; // Toggle between mock and real data
let lastRealDataTime = 0;
const REAL_DATA_TIMEOUT = 10000; // If no real data for 10s, use mock

// ============ API ENDPOINTS ============

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    mode: useRealData ? 'hardware' : 'mock',
    lastUpdate: latestReading?.timestamp || null
  });
});

// Get current sensor data
app.get('/api/data', (req, res) => {
  if (latestReading) {
    res.json(latestReading);
  } else {
    res.status(503).json({ error: 'No data available yet' });
  }
});

// Receive sensor data from hardware (ESP8266)
app.post('/api/sensor-data', (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.device_id || !data.sensors) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Add server timestamp
    data.timestamp = new Date().toISOString();

    // Store and broadcast
    latestReading = data;
    useRealData = true;
    lastRealDataTime = Date.now();

    io.emit('data_stream', latestReading);

    console.log(`[HARDWARE] Received from ${data.device_id}:`,
      `Temp=${data.sensors.dht22?.temperature}°C`,
      `Humidity=${data.sensors.dht22?.humidity}%`
    );

    res.json({ success: true, message: 'Data received' });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle between mock and real data
app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'mock') {
    useRealData = false;
    res.json({ mode: 'mock', message: 'Switched to mock data' });
  } else if (mode === 'hardware') {
    useRealData = true;
    res.json({ mode: 'hardware', message: 'Waiting for hardware data' });
  } else {
    res.status(400).json({ error: 'Invalid mode. Use "mock" or "hardware"' });
  }
});

// AI Chat Endpoint (Mock for Gemini)
app.post("/api/ai-chat", (req, res) => {
  const { message, context } = req.body;
  console.log("AI Query:", message, "Context:", context);

  // TODO: Replace with real Gemini API call
  let reply = "I'm still learning, but here's what I know about sensors!";

  if (context && context.sensor) {
    reply = `I see you're looking at the **${context.sensor}**. \n\nBased on your current data, everything looks normal. Would you like to know how the ${context.sensor} physically measures data?`;
  } else if (message.toLowerCase().includes("sensor")) {
    reply = "Sensors are devices that detect events or changes in the environment and send the information to other electronics, frequently a computer processor.";
  } else {
    reply = "I'm your AI Assistant. I can explain code, sensor physics, or help debug your experiments!";
  }

  // Simulate delay
  setTimeout(() => {
    res.json({ reply });
  }, 1000);
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
  const { sensorName, sensorId } = req.body;
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
});

// AI Graph Explanation Endpoint
app.post("/api/ai-explain", (req, res) => {
  const { sensorName, data } = req.body;
  console.log("Explaining graph for:", sensorName, "with", data?.length, "points");

  if (!data || data.length < 3) {
    return res.json({ explanation: "Not enough data points to analyze. Collect more readings." });
  }

  const values = data.map(d => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
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
});

// ============ MOCK DATA LOOP ============

// Generate mock data if no real hardware data
setInterval(() => {
  const now = Date.now();

  // If using real data but it's been too long, fall back to mock
  if (useRealData && (now - lastRealDataTime > REAL_DATA_TIMEOUT)) {
    console.log('[MOCK] No hardware data received, falling back to mock');
    useRealData = false;
  }

  // Only emit mock data if not using real hardware
  if (!useRealData) {
    latestReading = generateMockData();
    io.emit('data_stream', latestReading);
    console.log('[MOCK] Emitted:', latestReading.timestamp);
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
  console.log(`  GET  /api/data      - Get current sensor data`);
  console.log(`  POST /api/sensor-data - Receive hardware data`);
  console.log(`  POST /api/mode      - Switch mock/hardware mode`);
  console.log(`  POST /api/ai-chat   - AI Assistant chat`);
  console.log('');
});

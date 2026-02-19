require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
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

// AI Quiz Generation Endpoint
app.post("/api/ai-quiz", (req, res) => {
  const { sensorName, sensorId } = req.body;
  console.log("Generating quiz for:", sensorName);

  // Mock quiz questions - In production, use Gemini to generate these
  const quizBank = {
    "Temperature Sensor": [
      { question: "What type of resistor does the DHT22 use for temperature sensing?", options: ["PTC Thermistor", "NTC Thermistor", "Fixed Resistor", "Photoresistor"], correctIndex: 1, explanation: "NTC (Negative Temperature Coefficient) thermistors decrease resistance as temperature increases." },
      { question: "What equation describes the thermistor's resistance-temperature relationship?", options: ["Ohm's Law", "Steinhart-Hart Equation", "Newton's Law", "Kirchhoff's Law"], correctIndex: 1, explanation: "The Steinhart-Hart equation precisely models the non-linear relationship between temperature and resistance." },
      { question: "How many bits of data does the DHT22 transmit per reading?", options: ["8 bits", "16 bits", "32 bits", "40 bits"], correctIndex: 3, explanation: "The DHT22 sends 40 bits: 16 for humidity, 16 for temperature, and 8 for checksum." }
    ],
    "default": [
      { question: "What is the purpose of an ADC in sensor circuits?", options: ["Amplify signals", "Convert analog to digital", "Filter noise", "Store data"], correctIndex: 1, explanation: "ADC (Analog-to-Digital Converter) converts continuous analog signals to discrete digital values." },
      { question: "Why is calibration important for sensors?", options: ["Makes them faster", "Corrects manufacturing variations", "Reduces power consumption", "Changes the sensing range"], correctIndex: 1, explanation: "Calibration compensates for individual sensor variations to ensure accurate measurements." },
      { question: "What causes electrical noise in sensor readings?", options: ["Too much light", "Electromagnetic interference", "High temperature", "Low humidity"], correctIndex: 1, explanation: "EMI from nearby electronics, long wires, and power supply fluctuations cause noise." }
    ]
  };

  const questions = quizBank[sensorName] || quizBank["default"];

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

# 🔍 Code "Show & Tell" Guide

If an examiner asks to "See the code," open these files and point to these specific sections:

### 1. Hardware-to-Cloud Bridge (The "Glue")
*   **File**: `firmware/esp8266_bridge/esp8266_bridge.ino`
*   **Section**: `loop()` function.
*   **What to say**: "Here, the ESP8266 reads the Serial buffer from the Mega. Once it detects a full JSON object, it uses `http.POST` to send it to our cloud endpoint."

### 2. The Hybrid Mode Logic (The "Heart")
*   **File**: `backend/server.js`
*   **Section**: `mergeHardwareWithMock` function (around line 43).
*   **What to say**: "This is where the magic happens. We merge the virtual mock data with real hardware readings. If hardware data is available for a sensor, it overwrites the mock data. This creates a seamless hybrid experience."

### 3. AI Context Injection (The "Brain")
*   **File**: `backend/server.js`
*   **Section**: `/api/ai-chat` endpoint (around line 125).
*   **What to say**: "Notice the `systemPrompt`. We are injecting the `context.sensor` and `context.dataSnippet` into the prompt. This ensures the Gemini AI isn't just chatting generally—it's analyzing live sensor data."

### 4. Real-time UI Update
*   **File**: `frontend/src/app/RootLayoutClient.tsx` (or your socket hook)
*   **Section**: `socket.on('data_stream', ...)`
*   **What to say**: "This client-side listener waits for the backend to push data. The moment it arrives, we update the React state, which triggers a re-render of all charts and gauges instantly."

---

### 🎓 Pro Tip for the Viva:
When you explain a file, **don't read it line by line.** Instead, explain the **input**, the **transformation**, and the **output**.
*   *Example:* "The input is raw Serial data, the transformation is JSON packaging, and the output is an HTTP request."

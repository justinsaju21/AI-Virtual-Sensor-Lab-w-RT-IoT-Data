# 🌐 Deployment & Domain Configuration

This document explains how the **AI-Enabled Virtual Sensor Laboratory** is hosted and connected in a production environment.

## 🚀 Deployment Strategy
The project uses a "Split Infrastructure" approach to ensure both the UI and the real-time data streaming are stable.

### **1. Frontend: Hosted on Vercel**
- **Purpose:** Reliable delivery of the Next.js React dashboard.
- **Why Vercel?** Fast Global CDN, edge-optimized assets, and easy Next.js integration.
- **Root Directory:** `./frontend`

### **2. Backend: Hosted on Render**
- **Purpose:** Real-time data processing and persistent Socket.io connections.
- **Why Render?** Unlike Vercel, Render supports **Web Services** that maintain a permanent, open connection (WebSockets), which is critical for IoT data streams.
- **Start Command:** `node server.js`
- **Root Directory:** `./backend`

---

## 🛠 Linking the Two (Environment Variables)
The frontend needs to know where the backend is hiding. This is handled via a **Next.js Environment Variable**.

1. **RENDER_BACKEND_URL:** After deploying to Render, you get a link like `https://iot-lab-backend.onrender.com`.
2. **VERCEL_CONFIG:** Inside the Vercel project settings, we set:
   `NEXT_PUBLIC_SOCKET_URL=https://iot-lab-backend.onrender.com`

When the dashboard loads in your browser, it automatically checks this variable and opens a secure pipe to the cloud backend.

---

## 🏷 Domain Name Logic
For this project, the domain name used is:
**`ai-virtual-sensor-lab-w-rt-iot-data.vercel.app`**

### **Naming Strategy:**
- **AI-Enabled:** Highlights the advanced diagnostic features.
- **Virtual Sensor Lab:** Identifies the project as an educational simulation platform (Digital Twin).
- **RT-IoT-Data:** Emphasizes that the data shown is not just static, but "Real-Time" (HIL).

---

## 🔄 Updating the Deployment
To update the project, simply use standard Git commands:
1. `git add .`
2. `git commit -m "Your update message"`
3. `git push origin main`

Both Vercel and Render will automatically detect the push and redeploy the live site within 1-2 minutes.

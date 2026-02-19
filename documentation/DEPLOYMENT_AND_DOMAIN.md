# 🌐 Deployment, Hosting & Cloud Logic

This document provides a step-by-step walkthrough of how the **AI-Enabled Virtual Sensor Lab** is hosted in the cloud.

---

## 🏗️ 1. Why Two Platforms (Render + Vercel)?
A modern IoT web app cannot run on just one service because of the way data moves:
- **Vercel** is a "Serverless" platform. It is amazing for hosting high-speed websites, but it cannot keep a "Persistent Connection" open for long (it times out).
- **Render** is a "Server-Full" platform. It acts like a computer that never turns off, allowing it to keep that **Socket.io** connection open 24/7.

### **The Architecture:**
- **Frontend (The UI):** Hosted on Vercel.
- **Backend (The Brain):** Hosted on Render.

---

## 🚀 2. Frontend Configuration (Vercel)
### **Settings Applied:**
- **Project Name:** `AI-Virtual-Sensor-Lab`
- **Framework Preset:** Next.js
- **Root Directory:** `frontend` 
  - *Why? The laboratory code is inside the `frontend` folder, not at the root. Setting this correctly fixes the "404 Not Found" error.*
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### **The Critical Environment Variable:**
Vercel needs to know the address of the backend on Render. We set this in **Settings > Environment Variables**:
- **Key:** `NEXT_PUBLIC_SOCKET_URL`
- **Value:** Your unique Render URL (e.g., `https://iot-lab-backend.onrender.com`)

---

## 📡 3. Backend Configuration (Render)
### **Settings Applied:**
- **Service Type:** Web Service
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Root Directory:** `backend`

### **Environment Variable:**
To ensure the backend listens on the correct cloud port, we set:
- **Key:** `PORT`
- **Value:** `5000`

---

## 🏷 4. Domain & URL Strategy

### **Custom Domains:**
By default, Vercel gives you a link like `my-project-abcd.vercel.app`. For a professional college presentation, we update this to:
- **`ai-virtual-sensor-lab-w-rt-iot-data.vercel.app`**

### **How to Update Domain:**
1.  Go to Vercel **Dashboard > Settings > Domains**.
2.  Type in your new desired name.
3.  Click **Add**.

---

## 🔄 5. The "Redeploy" Workflow
Whenever you change the code on your project (e.g., updating a sensor name):
1.  **Git Push:** Push the code to GitHub.
2.  **Auto-Trigger:** Vercel and Render both detect the new code immediately.
3.  **Building:** They re-run `npm install` and `npm run build` in the cloud.
4.  **Live:** Your website updates automatically for everyone in the world.

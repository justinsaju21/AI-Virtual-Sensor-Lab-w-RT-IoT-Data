# IoT Virtual Sensor Laboratory

A complete IoT platform with a Next.js dashboard, Node.js backend, and Arduino/ESP8266 firmware.

## Project Structure

- **`/frontend`**: Next.js 16 + Tailwind CSS v4 dashboard
- **`/backend`**: Node.js + Express + Socket.io server
- **`/firmware`**: Arduino Mega and ESP8266 code

## 🚀 Getting Started for Team Members

### 1. Prerequisites
- Node.js (v18+) installed
- Git installed
- VS Code (recommended)

### 2. Setup

Clone the repository:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd iot-virtual-lab
```

### 3. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend
npm install
```

### 4. Environment Variables

Create a `.env` file in **`/backend`**:
```env
PORT=5000
```
*(Ask the team lead for any other secret keys)*

### 5. Running the Project

You need two terminals running simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🤝 Collaboration Workflow

1. **Pull latest changes** before starting work:
   ```bash
   git pull origin main
   ```
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Added feature X"
   ```
4. **Push to GitHub**:
   ```bash
   git push origin feature-name
   ```
5. **Create a Pull Request (PR)** on GitHub to merge into `main`.

## 🛠 Hardware Setup

See [firmware/HARDWARE_SETUP.md](./firmware/HARDWARE_SETUP.md) for wiring diagrams and flashing instructions.

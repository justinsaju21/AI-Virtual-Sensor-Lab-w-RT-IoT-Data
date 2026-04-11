#!/bin/bash
# Start IoT Virtual Lab locally (macOS/Linux)
# This script starts both backend and frontend in parallel

echo "🚀 Starting IoT Virtual Lab..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Start Backend
echo ""
echo "${BLUE}→ Starting Backend (Port 5000)...${NC}"
cd "$(dirname "$0")/backend"
if [ ! -d "node_modules" ]; then
    echo "  Installing backend dependencies..."
    npm install > /dev/null 2>&1
fi
npm start &
BACKEND_PID=$!
echo "${GREEN}✓ Backend starting (PID: $BACKEND_PID)${NC}"

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo ""
echo "${BLUE}→ Starting Frontend (Port 3000)...${NC}"
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi
npm run dev &
FRONTEND_PID=$!
echo "${GREEN}✓ Frontend starting (PID: $FRONTEND_PID)${NC}"

# Display summary
echo ""
echo "════════════════════════════════════════════════════"
echo "${GREEN}✓ IoT Virtual Lab is running!${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "📊 Dashboard:  ${BLUE}http://localhost:3000${NC}"
echo "🔌 Backend:    ${BLUE}http://localhost:5000${NC}"
echo ""
echo "Processes:"
echo "  • Backend (Node):  PID $BACKEND_PID"
echo "  • Frontend (Next): PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"
echo "════════════════════════════════════════════════════"
echo ""

# Handle cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✓ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait

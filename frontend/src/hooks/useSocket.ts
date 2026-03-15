"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SensorData } from "../types/sensorData";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [data, setData] = useState<SensorData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL);

        socketInstance.on("connect", () => {
            console.log("Connected to backend");
            setIsConnected(true);
            setError(null);
        });

        socketInstance.on("disconnect", () => {
            console.log("Disconnected from backend");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
            setIsConnected(false);
            setError(`Cannot reach server: ${err.message}`);
        });

        socketInstance.on("data_stream", (newData: SensorData) => {
            setData(newData);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return { socket, isConnected, data, error };
};

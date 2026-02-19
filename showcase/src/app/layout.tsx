import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Enabled IoT Virtual Sensor Laboratory | Digital Twin Platform",
  description: "Advanced hybrid Digital Twin platform for high-density IoT sensor acquisition and diagnostic education. Features 17+ sensors, AI analytics, and real-time DSP.",
  keywords: ["IoT", "Digital Twin", "Virtual Lab", "Sensor", "Arduino", "AI", "Cloud IoT", "SEM6 Project"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", background: "#030712", color: "#e2e8f0", margin: 0, overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}

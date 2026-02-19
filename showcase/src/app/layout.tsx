import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Enabled IoT Virtual Sensor Laboratory | Digital Twin Platform",
  description: "A hybrid Digital Twin virtual lab for scalable IoT education. 17-sensor platform with fault injection, DSP, and AI-powered diagnostics.",
  keywords: ["IoT", "Digital Twin", "Virtual Lab", "Sensor", "Arduino", "AI", "Education"],
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

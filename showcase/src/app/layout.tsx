import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Enabled IoT Virtual Sensor Laboratory | Digital Twin Platform",
  description: "A hybrid Digital Twin virtual lab for scalable IoT education. Real hardware. Real-time data. AI-driven diagnostics. 17-sensor platform with fault injection, DSP, and AI-powered analysis.",
  keywords: ["IoT", "Digital Twin", "Virtual Lab", "Sensor", "Arduino", "AI", "Education", "Engineering"],
  openGraph: {
    title: "AI-Enabled IoT Virtual Sensor Laboratory",
    description: "Hybrid Digital Twin with Real-Time Hardware Integration",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased grid-bg">
        {children}
      </body>
    </html>
  );
}

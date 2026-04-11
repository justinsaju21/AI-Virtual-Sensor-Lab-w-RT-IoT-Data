import { redirect } from "next/navigation";

// Map sensor IDs to their existing detail pages
const SENSOR_REDIRECTS: Record<string, string> = {
    ldr: "/sensors/light",
    pir: "/sensors/motion",
    max30102: "/sensors/heartbeat",
    thermistor: "/sensors/temperature",
};

export default function LDRPage() {
    redirect(SENSOR_REDIRECTS.ldr);
}

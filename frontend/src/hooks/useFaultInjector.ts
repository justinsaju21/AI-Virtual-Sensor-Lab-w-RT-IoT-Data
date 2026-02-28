import { useState, useEffect } from 'react';

export type FaultType = 'none' | 'stuck-at-zero' | 'stuck-at-high' | 'open-circuit' | 'noise-burst' | 'drift' | 'offset';

interface FaultConfig {
    type: FaultType;
    params?: {
        noiseAmplitude?: number; // For noise-burst
        driftRate?: number;      // For drift
        offsetValue?: number;    // For calibration/offset fault
    };
}

/**
 * Hook to inject simulated faults into sensor data for testing/testing purposes.
 * @param realValue The actual sensor value stream
 */
export function useFaultInjector(realValue: number | number | null) {
    const [fault, setFault] = useState<FaultConfig>({ type: 'none' });
    const [injectedValue, setInjectedValue] = useState<number | null>(realValue);

    useEffect(() => {
        if (realValue === null) {
            setInjectedValue(null);
            return;
        }

        let intervalId: NodeJS.Timeout;

        const updateFaultValue = () => {
            switch (fault.type) {
                case 'stuck-at-zero':
                    setInjectedValue(0);
                    break;
                case 'stuck-at-high':
                    setInjectedValue(1023); // Max ADC value typically
                    break;
                case 'open-circuit':
                    setInjectedValue(NaN); // Simulate disconnected wire
                    break;
                case 'noise-burst':
                    const noise = (Math.random() - 0.5) * (fault.params?.noiseAmplitude || 50);
                    setInjectedValue(realValue + noise);
                    break;
                case 'drift':
                    // Simple linear drift accumulating over time locally
                    const rate = fault.params?.driftRate || 0.5;
                    const driftAmount = (Date.now() % 10000) * 0.001 * rate;
                    setInjectedValue(realValue + driftAmount);
                    break;
                case 'offset':
                    setInjectedValue(realValue + (fault.params?.offsetValue || 0));
                    break;
                case 'none':
                default:
                    setInjectedValue(realValue);
                    break;
            }
        };

        // Run immediately when realValue or fault changes
        updateFaultValue();

        // If the fault is dynamic (changes continuously even if realValue is static), set an interval
        if (fault.type === 'noise-burst' || fault.type === 'drift') {
            intervalId = setInterval(updateFaultValue, 200); // 5Hz update rate
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [realValue, fault]);

    return {
        injectedValue,
        fault,
        setFault
    };
}

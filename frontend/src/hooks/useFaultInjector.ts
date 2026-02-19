
import { useState, useCallback } from 'react';

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
    const [driftAccumulator, setDriftAccumulator] = useState(0);

    const injectFault = useCallback((value: number | null): number | null => {
        if (value === null) return null;

        switch (fault.type) {
            case 'stuck-at-zero':
                return 0;
            case 'stuck-at-high':
                return 1023; // Max ADC value typically
            case 'open-circuit':
                return NaN; // Simulate disconnected wire
            case 'noise-burst':
                const noise = (Math.random() - 0.5) * (fault.params?.noiseAmplitude || 50);
                return value + noise;
            case 'drift':
                // Simple linear drift
                const rate = fault.params?.driftRate || 0.5;
                // Ideally we'd use a ref or effect for time-based drift, 
                // but simple accumulation on render is okay for this demo level
                return value + (Date.now() % 10000) * 0.001 * rate;
            case 'offset':
            case 'offset':
                return value + (fault.params?.offsetValue || 0);
            case 'none':
            default:
                return value;
        }
    }, [fault]);

    return {
        injectedValue: injectFault(realValue),
        fault,
        setFault
    };
}

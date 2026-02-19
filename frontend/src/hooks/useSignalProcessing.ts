
import { useState, useMemo } from 'react';

export type FilterType = 'none' | 'moving-average' | 'threshold' | 'kalman-simple';

interface FilterConfig {
    type: FilterType;
    windowSize?: number; // For moving average
    threshold?: number;  // For thresholding
}

export function useSignalProcessing(dataStream: number[]) {
    const [filter, setFilter] = useState<FilterConfig>({ type: 'none', windowSize: 5 });

    const processedData = useMemo(() => {
        if (dataStream.length === 0) return [];

        switch (filter.type) {
            case 'moving-average':
                const window = filter.windowSize || 5;
                return dataStream.map((_, idx, arr) => {
                    if (idx < window - 1) return arr[idx]; // Not enough data yet
                    const subset = arr.slice(idx - window + 1, idx + 1);
                    const sum = subset.reduce((a, b) => a + b, 0);
                    return sum / subset.length;
                });

            case 'threshold':
                // Simple noise gate / threshold
                const thres = filter.threshold || 10;
                return dataStream.map((val, idx, arr) => {
                    if (idx === 0) return val;
                    const diff = Math.abs(val - arr[idx - 1]);
                    return diff < thres ? arr[idx - 1] : val; // Debounce changes smaller than threshold
                });

            case 'none':
            default:
                return [...dataStream];
        }
    }, [dataStream, filter]);

    return { filter, setFilter, processedData };
}

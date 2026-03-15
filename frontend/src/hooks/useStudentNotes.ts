import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting student notes per sensor in localStorage
 */
export function useStudentNotes(sensorId: string) {
    const storageKey = `iot-lab-notes-${sensorId}`;

    const [notes, setNotes] = useState<string>('');
    const [isSaved, setIsSaved] = useState(true);

    // Load notes from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setNotes(saved);
            }
        } catch (err) {
            console.warn('Failed to load notes from localStorage:', err);
        }
    }, [storageKey]);

    // Auto-save with debounce
    useEffect(() => {
        if (typeof window === 'undefined') return;
        setIsSaved(false);
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, notes);
            } catch (err) {
                console.warn('Failed to save notes to localStorage:', err);
            }
            setIsSaved(true);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [notes, storageKey]);

    return { notes, setNotes, isSaved };
}

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
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setNotes(saved);
        }
    }, [storageKey]);

    // Auto-save with debounce
    useEffect(() => {
        setIsSaved(false);
        const timeout = setTimeout(() => {
            localStorage.setItem(storageKey, notes);
            setIsSaved(true);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [notes, storageKey]);

    return { notes, setNotes, isSaved };
}

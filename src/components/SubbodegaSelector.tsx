'use client';

import React, { useState, useEffect } from 'react';
import { Subbodega } from '@/types';

interface SubbodegaSelectorProps {
    subbodegas: Subbodega[];
    selectedId: string;
    onChange: (id: string) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    disabledIds?: string[];
    className?: string;
    errorColor?: string; // 'rose' or 'orange'
    showAllOption?: boolean;
    allOptionLabel?: string;
}

export function SubbodegaSelector({
    subbodegas,
    selectedId,
    onChange,
    label = "Ubicación (Subbodega)",
    required = false,
    disabled = false,
    disabledIds = [],
    className = "",
    errorColor = "orange",
    showAllOption = false,
    allOptionLabel = "Seleccionar ubicación..."
}: SubbodegaSelectorProps) {
    // Current selected path of IDs
    const [selectedPath, setSelectedPath] = useState<string[]>([]);

    // Effect to build the path when selectedId changes externally
    useEffect(() => {
        if (!selectedId) {
            setSelectedPath([]);
            return;
        }

        const buildPath = (id: string): string[] => {
            const current = subbodegas.find(sb => sb.id.toString() === id);
            if (!current) return [];
            if (current.parent) {
                return [...buildPath(current.parent.toString()), id];
            }
            return [id];
        };

        const path = buildPath(selectedId);
        // Only update if it's different to avoid loops
        if (path.join(',') !== selectedPath.join(',')) {
            setSelectedPath(path);
        }
    }, [selectedId, subbodegas]);

    const handleSelectChange = (level: number, value: string) => {
        const newPath = [...selectedPath.slice(0, level)];
        if (value) {
            newPath.push(value);
        }
        setSelectedPath(newPath);

        // Pass the most specific ID (the last one in the path) or empty string
        onChange(newPath.length > 0 ? newPath[newPath.length - 1] : '');
    };

    // Get levels to render
    const levels: Subbodega[][] = [];

    // Level 0: Top level subbodegas (no parent)
    levels.push(subbodegas.filter(sb => !sb.parent && sb.activo));

    // Subsequent levels
    selectedPath.forEach((id, index) => {
        const children = subbodegas.filter(sb => sb.parent?.toString() === id && sb.activo);
        if (children.length > 0) {
            levels.push(children);
        }
    });

    const ringColor = errorColor === 'rose' ? 'focus:ring-rose-500/20 focus:border-rose-500' : 'focus:ring-orange-500/20 focus:border-orange-500';

    return (
        <div className={`space-y-3 ${className}`}>
            {levels.map((levelOptions, index) => {
                const currentVal = selectedPath[index] || '';

                // If it's not the first level and there are no options, don't render (though the logic above should prevent this)
                if (index > 0 && levelOptions.length === 0) return null;

                return (
                    <div key={index} className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">
                            {index === 0 ? label : `Sub-nivel ${index + 1}`} {required && index === 0 && '*'}
                        </label>
                        <select
                            required={required && index === 0}
                            disabled={disabled}
                            className={`w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 outline-none transition-all ${ringColor}`}
                            value={currentVal}
                            onChange={(e) => handleSelectChange(index, e.target.value)}
                        >
                            <option value="">{index === 0 ? allOptionLabel : "Seleccionar sub-nivel..."}</option>
                            {levelOptions
                                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                .map(sb => (
                                    <option key={sb.id} value={sb.id.toString()} disabled={disabledIds.includes(sb.id.toString())}>
                                        {sb.nombre} {disabledIds.includes(sb.id.toString()) ? '(No disponible)' : ''}
                                    </option>
                                ))}
                        </select>
                    </div>
                );
            })}
        </div>
    );
}

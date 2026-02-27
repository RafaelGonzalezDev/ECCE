'use client';

import { useTheme } from '@/context/ThemeContext';
import { ChangeEvent } from 'react';

export default function ColorPicker() {
    const { theme, updateTheme, resetTheme } = useTheme();

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateTheme({ [name]: value });
    };

    const colorPresets = [
        { name: 'Azul', primary: '#3b82f6', bg: '#ffffff', text: '#111827' },
        { name: 'Morado', primary: '#9333ea', bg: '#faf5ff', text: '#3b0764' },
        { name: 'Modo Oscuro', primary: '#60a5fa', bg: '#111827', text: '#f9fafb' },
        { name: 'Bosque', primary: '#16a34a', bg: '#f0fdf4', text: '#14532d' },
        { name: 'Atardecer', primary: '#ea580c', bg: '#fff7ed', text: '#7c2d12' },
    ];

    return (
        <div className="bg-white/5 dark:bg-black/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-primary/10">
            <h2 className="text-2xl font-semibold mb-6">Ajustes de Tema</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium opacity-80 mb-2">Color Principal</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="color"
                            name="primaryColor"
                            value={theme.primaryColor}
                            onChange={handleColorChange}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="font-mono text-sm opacity-60">{theme.primaryColor}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium opacity-80 mb-2">Color de Fondo</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="color"
                            name="backgroundColor"
                            value={theme.backgroundColor}
                            onChange={handleColorChange}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="font-mono text-sm opacity-60">{theme.backgroundColor}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium opacity-80 mb-2">Color de Texto</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="color"
                            name="textColor"
                            value={theme.textColor}
                            onChange={handleColorChange}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="font-mono text-sm opacity-60">{theme.textColor}</span>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-primary/10">
                <h3 className="text-sm font-medium opacity-80 mb-4">Ajustes Rápidos</h3>
                <div className="flex flex-wrap gap-3">
                    {colorPresets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => updateTheme({
                                primaryColor: preset.primary,
                                backgroundColor: preset.bg,
                                textColor: preset.text
                            })}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center space-x-2"
                            style={{ backgroundColor: preset.bg, color: preset.text, border: `1px solid ${preset.primary}` }}
                        >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                            <span>{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={resetTheme}
                    className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--text-color)] bg-[var(--text-color)]/10 hover:bg-[var(--text-color)]/20 transition-colors"
                >
                    Restaurar Valores
                </button>
            </div>
        </div>
    );
}

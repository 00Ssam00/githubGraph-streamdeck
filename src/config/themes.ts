/**
 * Paletas de colores para temas claro y oscuro
 */

export interface ThemeColors {
    background: string;
    level0: string;  // Sin commits
    level1: string;  // Bajo
    level2: string;  // Medio-bajo
    level3: string;  // Medio-alto
    level4: string;  // Alto
}

export const Themes: Record<'dark' | 'light', ThemeColors> = {
    dark: {
        background: '#0d1117',
        level0: '#151b23',
        level1: '#033a16',
        level2: '#196c2e',
        level3: '#2ea043',
        level4: '#56d364',
    },
    light: {
        background: '#ffffff',
        level0: '#e5ebf1',
        level1: '#aceebb',
        level2: '#4ac26b',
        level3: '#2da44e',
        level4: '#116329',
    }
};
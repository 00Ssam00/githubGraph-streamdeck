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
        level0: '#161b22',
        level1: '#0e4429',
        level2: '#006d32',
        level3: '#26a641',
        level4: '#39d353',
    },
    light: {
        background: '#ffffff',
        level0: '#ebedf0',
        level1: '#9be9a8',
        level2: '#40c463',
        level3: '#30a14e',
        level4: '#216e39',
    }
};
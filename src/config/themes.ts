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
        // Paleta de colores oficial de GitHub contribution heatmap (dark)
        // El background fue editado para mejor visualizacion y contraste
        // Referencia: https://github.com/primer/primitives/blob/main/data/colors/darkColors.json
        background: "#0d1117",
        level0: "#161b22", // 0 commits (background)
        level1: "#0e4429", // 1er nivel (verde muy oscuro)
        level2: "#006d32", // 2do nivel (verde oscuro)
        level3: "#26a641", // 3er nivel (verde medio)
        level4: "#39d353", // 4to nivel (verde claro, el más intenso)
    },
    light: {
        // Paleta de colores oficial de GitHub contribution heatmap (light)
        // Referencia: https://github.com/primer/primitives/blob/main/data/colors/scaleColors.json
        background: "#ffffff",
        level0: "#ebedf0", // 0 commits
        level1: "#9be9a8", // 1er nivel (verde muy claro)
        level2: "#40c463", // 2do nivel (verde claro)
        level3: "#30a14e", // 3er nivel (verde medio)
        level4: "#216e39", // 4to nivel (verde oscuro, el más intenso)
    }
};

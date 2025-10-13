import type { JsonObject } from "@elgato/streamdeck";

/**
 * Configuración de las acciones del heatmap
 */
export interface HeatmapSettings extends JsonObject {
    theme: 'dark' | 'light';
}

/**
 * Configuración por defecto
 */
export const defaultSettings: HeatmapSettings = {
    theme: 'dark'
};

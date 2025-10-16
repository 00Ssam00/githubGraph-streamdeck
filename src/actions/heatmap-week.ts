import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
    DidReceiveSettingsEvent
} from "@elgato/streamdeck";
import { GitHubService } from "../services/github-service";
import { Config } from "../config";
import { Themes } from "../config/themes";
import { HeatmapSettings, defaultSettings } from "../types/settings";

@action({ UUID: "com.ssam00.githubgraph.week" })
export class HeatmapWeek extends SingletonAction<HeatmapSettings> {
    private githubService: GitHubService;
    private updateInterval: NodeJS.Timeout | null = null;
    private readonly UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos en milisegundos

    constructor() {
        super();
        const GITHUB_TOKEN = Config.githubToken;
        if (!GITHUB_TOKEN || GITHUB_TOKEN === "TU_TOKEN_AQUI") {
            console.error("⚠️ GITHUB_TOKEN no configurado");
        }
        this.githubService = new GitHubService(GITHUB_TOKEN);
    }
    override async onWillAppear(ev: WillAppearEvent<HeatmapSettings>): Promise<void> {
        console.log("🟢 HeatmapWeek: Botón apareció");
        // Inicializar settings si no existen
        const settings = ev.payload.settings;
        if (!settings.theme) {
            await ev.action.setSettings(defaultSettings);
            console.log("⚙️ Settings inicializados con tema por defecto:", defaultSettings.theme);
        }
        try {
            await this.fetchAndUpdate(ev.action, settings.theme || defaultSettings.theme);
            this.startAutoUpdate(ev.action);
        } catch (error) {
            console.error("❌ Error en onWillAppear:", error);
        }
    }
    override async onWillDisappear(ev: WillDisappearEvent<HeatmapSettings>): Promise<void> {
        console.log("🔴 HeatmapWeek: Botón desapareció");
        // Detener actualización automática
        this.stopAutoUpdate();
    }
    override async onKeyDown(ev: KeyDownEvent<HeatmapSettings>): Promise<void> {
        console.log("🔵 HeatmapWeek: Botón presionado (actualización manual)");
        try {
            const theme = ev.payload.settings.theme || defaultSettings.theme;
            // Actualizar manualmente
            await this.fetchAndUpdate(ev.action, theme);
        } catch (error) {
            console.error("❌ Error en onKeyDown:", error);
            await ev.action.showAlert();
        }
    }

    /**
     * Se ejecuta cuando cambian los settings desde el Property Inspector
     */
    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<HeatmapSettings>): Promise<void> {
        const newTheme = ev.payload.settings.theme || defaultSettings.theme;
        console.log("🎨 Settings actualizados - Aplicando cambios automáticamente");
        console.log("📝 Nuevo tema:", newTheme);
        try {
            await this.fetchAndUpdate(ev.action, newTheme);
            console.log("✅ Tema aplicado correctamente");
        } catch (error) {
            console.error("❌ Error al aplicar nuevo tema:", error);
        }
    }

    private startAutoUpdate(action: any): void {
        // Limpiar intervalo anterior si existe
        this.stopAutoUpdate();
        console.log(`⏰ Iniciando actualización automática cada ${this.UPDATE_INTERVAL_MS / 60000} minutos`);
        this.updateInterval = setInterval(async () => {
            console.log("🔄 Actualización automática ejecutándose...");
            try {
                const settings = await action.getSettings();
                const theme = settings.theme || defaultSettings.theme;
                await this.fetchAndUpdate(action, theme);
                console.log("✅ Actualización automática completada");
            } catch (error) {
                console.error("❌ Error en actualización automática:", error);
            }
        }, this.UPDATE_INTERVAL_MS);
    }
    /**
     * Detiene la actualización automática
     */
    private stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log("⏹️ Actualización automática detenida");
        }
    }
    private async fetchAndUpdate(action: any, theme: 'dark' | 'light'): Promise<void> {
        const weekData = await this.githubService.getLastWeekCommits();
        await this.updateDisplay(action, weekData, theme);
    }

    // Color level estilo GitHub (basado en el máximo de commits)
    private getGitHubColorLevel(commits: number, maxCommits: number): number {
        if (commits === 0) return 0;
        if (commits <= Math.ceil(maxCommits * 0.25)) return 1;
        if (commits <= Math.ceil(maxCommits * 0.5)) return 2;
        if (commits <= Math.ceil(maxCommits * 0.75)) return 3;
        return 4;
    }

    private async updateDisplay(action: any, weekData: number[], theme: 'dark' | 'light'): Promise<void> {
        const imageData = this.generateHeatmapImage(weekData, theme);
        await action.setImage(imageData);
    }

    private generateHeatmapImage(weekData: number[], theme: 'dark' | 'light'): string {
        const canvasSize = 144;
        const cellSize = 22;
        const gap = 4;
        const rows = 2;
        const maxCols = 4;

        const row1Data = weekData.slice(0, 4);
        const row2Data = weekData.slice(4, 7);
        const gridData = [row1Data, row2Data];

        const gridWidth = maxCols * cellSize + (maxCols - 1) * gap;
        const gridHeight = rows * cellSize + (rows - 1) * gap;

        const offsetX = (canvasSize - gridWidth) / 2;
        const offsetY = (canvasSize - gridHeight) / 2;

        // Usar tema seleccionado por el usuario
        const colors = Themes[theme];
        console.log(`🎨 Generando heatmap con tema: ${theme}`);

        const colorMap: { [key: number]: string } = {
            0: colors.level0,
            1: colors.level1,
            2: colors.level2,
            3: colors.level3,
            4: colors.level4,
        };

        const maxCommits = Math.max(...weekData);

        let svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${canvasSize}" height="${canvasSize}" fill="${colors.background}" rx="8"/>`;

        for (let row = 0; row < rows; row++) {
            const currentRowData = gridData[row];

            for (let col = 0; col < currentRowData.length; col++) {
                const commits = currentRowData[col];
                const colorLevel = this.getGitHubColorLevel(commits, maxCommits);

                const x = offsetX + col * (cellSize + gap);
                const y = offsetY + row * (cellSize + gap);
                const color = colorMap[colorLevel];

                svg += `
                    <rect
                        x="${x}"
                        y="${y}"
                        width="${cellSize}"
                        height="${cellSize}"
                        fill="${color}"
                        rx="3"
                    />
                `;
            }
        }

        svg += `</svg>`;
        const base64 = Buffer.from(svg).toString('base64');
        return `data:image/svg+xml;base64,${base64}`;
    }
}
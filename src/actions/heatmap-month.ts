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

@action({ UUID: "com.ssam00.githubgraph.month" })
export class HeatmapMonth extends SingletonAction<HeatmapSettings> {
    private githubService: GitHubService;
    private updateInterval: NodeJS.Timeout | null = null;
    private readonly UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos

    constructor() {
        super();
        const GITHUB_TOKEN = Config.githubToken;
        if (!GITHUB_TOKEN || GITHUB_TOKEN === "TU_TOKEN_AQUI") {
            console.error("⚠️ GITHUB_TOKEN no configurado");
        }
        this.githubService = new GitHubService(GITHUB_TOKEN);
    }
    override async onWillAppear(ev: WillAppearEvent<HeatmapSettings>): Promise<void> {
        console.log("🟢 HeatmapMonth: Botón apareció");
        // Inicializar settings si no existen
        const settings = ev.payload.settings;
        if (!settings.theme) {
            await ev.action.setSettings(defaultSettings);
            console.log("⚙️ Settings inicializados con tema por defecto:", defaultSettings.theme);
        }
        try {
            const theme = settings.theme || defaultSettings.theme;
            await this.fetchAndUpdate(ev.action, theme);
            this.startAutoUpdate(ev.action);
        } catch (error) {
            console.error("❌ Error en onWillAppear:", error);
        }
    }
    override async onWillDisappear(ev: WillDisappearEvent<HeatmapSettings>): Promise<void> {
        console.log("🔴 HeatmapMonth: Botón desapareció");
        this.stopAutoUpdate();
    }
    override async onKeyDown(ev: KeyDownEvent<HeatmapSettings>): Promise<void> {
        console.log("🔵 HeatmapMonth: Botón presionado");

        try {
            const theme = ev.payload.settings.theme || defaultSettings.theme;
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

    private stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log("⏹️ Actualización automática detenida");
        }
    }
    private async fetchAndUpdate(action: any, theme: 'dark' | 'light'): Promise<void> {
        const monthData = await this.githubService.getLastMonthCommits();
        await this.updateDisplay(action, monthData, theme);
    }

    // Color level estilo GitHub (basado en el máximo de commits)
    private getGitHubColorLevel(commits: number, maxCommits: number): number {
        if (commits === 0) return 0;
        if (commits <= Math.ceil(maxCommits * 0.25)) return 1;
        if (commits <= Math.ceil(maxCommits * 0.5)) return 2;
        if (commits <= Math.ceil(maxCommits * 0.75)) return 3;
        return 4;
    }

    private async updateDisplay(action: any, monthData: number[], theme: 'dark' | 'light'): Promise<void> {
        const imageData = this.generateHeatmapImage(monthData, theme);
        await action.setImage(imageData);
    }

    private generateHeatmapImage(monthData: number[], theme: 'dark' | 'light'): string {
        const canvasSize = 144;
        const cellSize = 18;
        const gap = 3;
        const cols = 6;
        const rows = 5;

        const gridWidth = cols * cellSize + (cols - 1) * gap;
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

        const maxCommits = Math.max(...monthData);

        let svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${canvasSize}" height="${canvasSize}" fill="${colors.background}" rx="8"/>`;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                if (index < monthData.length) {
                    const commits = monthData[index];
                    const colorLevel = this.getGitHubColorLevel(commits, maxCommits);
                    const x = offsetX + col * (cellSize + gap);
                    const y = offsetY + row * (cellSize + gap);
                    const color = colorMap[colorLevel];
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2"/>`;
                }
            }
        }

        svg += `</svg>`;
        const base64 = Buffer.from(svg).toString('base64');
        return `data:image/svg+xml;base64,${base64}`;
    }
}
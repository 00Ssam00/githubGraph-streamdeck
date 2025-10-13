import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent
} from "@elgato/streamdeck";
import { GitHubService } from "../services/github-service";
import { Config } from "../config";
import { Themes } from "../config/themes";

@action({ UUID: "com.ssam00.githubgraph.month" })
export class HeatmapMonth extends SingletonAction {
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

    override async onWillAppear(ev: WillAppearEvent): Promise<void> {
        console.log("🟢 HeatmapMonth: Botón apareció");

        try {
            await this.fetchAndUpdate(ev.action);
            this.startAutoUpdate(ev.action);
        } catch (error) {
            console.error("❌ Error en onWillAppear:", error);
        }
    }

    override async onWillDisappear(ev: WillDisappearEvent): Promise<void> {
        console.log("🔴 HeatmapMonth: Botón desapareció");
        this.stopAutoUpdate();
    }

    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
        console.log("🔵 HeatmapMonth: Botón presionado");

        try {
            await this.fetchAndUpdate(ev.action);
        } catch (error) {
            console.error("❌ Error en onKeyDown:", error);
            await ev.action.showAlert();
        }
    }

    private startAutoUpdate(action: any): void {
        this.stopAutoUpdate();

        console.log(`⏰ [Month] Iniciando actualización automática cada ${this.UPDATE_INTERVAL_MS / 60000} minutos`);

        this.updateInterval = setInterval(async () => {
            console.log("🔄 [Month] Actualización automática...");
            try {
                await this.fetchAndUpdate(action);
                console.log("✅ [Month] Actualización completada");
            } catch (error) {
                console.error("❌ [Month] Error en actualización:", error);
            }
        }, this.UPDATE_INTERVAL_MS);
    }

    private stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log("⏹️ [Month] Actualización detenida");
        }
    }

    private async fetchAndUpdate(action: any): Promise<void> {
        const monthData = await this.githubService.getLastMonthCommits();
        await this.updateDisplay(action, monthData);
    }

    private getColorLevel(commits: number): number {
        if (commits === 0) return 0;
        if (commits <= 2) return 1;
        if (commits <= 4) return 2;
        if (commits <= 7) return 3;
        return 4;
    }

    private async updateDisplay(action: any, monthData: number[]): Promise<void> {
        const imageData = this.generateHeatmapImage(monthData);
        await action.setImage(imageData);
    }

    private generateHeatmapImage(monthData: number[]): string {
        const canvasSize = 144;
        const cellSize = 18;
        const gap = 3;
        const cols = 6;
        const rows = 5;

        // Distribuir 30 días en cuadrícula de 6×5
        const gridData: number[][] = [];
        for (let row = 0; row < rows; row++) {
            const rowData: number[] = [];
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                rowData.push(index < monthData.length ? monthData[index] : 0);
            }
            gridData.push(rowData);
        }

        const gridWidth = cols * cellSize + (cols - 1) * gap;
        const gridHeight = rows * cellSize + (rows - 1) * gap;

        const offsetX = (canvasSize - gridWidth) / 2;
        const offsetY = (canvasSize - gridHeight) / 2;

        const colors = Themes['dark'];

        const colorMap: { [key: number]: string } = {
            0: colors.level0,
            1: colors.level1,
            2: colors.level2,
            3: colors.level3,
            4: colors.level4,
        };

        let svg = `
            <svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${canvasSize}" height="${canvasSize}" fill="${colors.background}"/>
        `;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const commits = gridData[row][col];
                const colorLevel = this.getColorLevel(commits);

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
                        rx="2"
                    />
                `;
            }
        }

        svg += `</svg>`;
        const base64 = Buffer.from(svg).toString('base64');
        return `data:image/svg+xml;base64,${base64}`;
    }
}
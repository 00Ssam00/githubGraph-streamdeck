import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
@action({ UUID: "com.ssam00.githubgraph.week" })
export class HeatmapWeek extends SingletonAction {
	// Se ejecuta al aparecer el boton
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		// Generar datos aleatorios iniciales
		const weekData = this.generateWeekData();
		await this.updateDisplay(ev.action, weekData);
	}
	// Se ejecuta al presionar el boton
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		// Generar nuevos datos aleatorios
		const weekData = this.generateWeekData();
		// Actualizar la imagen
		await this.updateDisplay(ev.action, weekData);
	}

	// Genera datos aleatorios para 7 días (0-10 commits por día)
	private generateWeekData(): number[] {
		const data: number[] = [];
		for (let i = 0; i < 7; i++) {
			// Generar entre 0 y 10 commits por día
			data.push(Math.floor(Math.random() * 11));
		}
		return data;
	}
	// Mapea la cantidad de commits a un nivel de color (0-4)
	private getColorLevel(commits: number): number {
		if (commits === 0) return 0;      // Sin commits
		if (commits <= 2) return 1;       // Bajo (1-2)
		if (commits <= 4) return 2;       // Medio-bajo (3-4)
		if (commits <= 7) return 3;       // Medio-alto (5-7)
		return 4;                         // Alto (8+)
	}
	// Método para actualizar la imagen del botón
	private async updateDisplay(action: any, weekData: number[]): Promise<void> {
		const imageData = this.generateHeatmapImage(weekData);
		await action.setImage(imageData);
	}
	//Genera la imagen del heatmap basada en datos reales
	private generateHeatmapImage(weekData: number[]): string {
		// Dimensiones fijas del botón Stream Deck
		const canvasSize = 144;
		// Configuración del heatmap
		const cellSize = 22;
		const gap = 4;
		const rows = 2;
		const maxCols = 4;
		// Distribuir 7 días en 2 filas (4+3)
		const row1Data = weekData.slice(0, 4);	// Primeros 4 días
		const row2Data = weekData.slice(4, 7);	// Últimos 3 días
		const gridData = [row1Data, row2Data];
		// Calcular dimensiones
		const gridWidth = maxCols * cellSize + (maxCols - 1) * gap;
		const gridHeight = rows * cellSize + (rows - 1) * gap;
		const offsetX = (canvasSize - gridWidth) / 2;
		const offsetY = (canvasSize - gridHeight) / 2;
		// Paleta de colores GitHub (tema oscuro)
		const colors: { [key: number]: string } = {
		0: '#161b22',  // Sin commits
		1: '#0e4429',  // Nivel bajo
		2: '#006d32',  // Nivel medio-bajo
		3: '#26a641',  // Nivel medio-alto
		4: '#39d353',  // Nivel alto
		};
		// Construir SVG
		let svg = `
		<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
			<rect width="${canvasSize}" height="${canvasSize}" fill="#0d1117"/>
		`;
		// Generar cada celda
		for (let row = 0; row < rows; row++) {
			const currentRowData = gridData[row];
			for (let col = 0; col < currentRowData.length; col++) {
				const commits = currentRowData[col];
				const colorLevel = this.getColorLevel(commits);
				const x = offsetX + col * (cellSize + gap);
				const y = offsetY + row * (cellSize + gap);
				const color = colors[colorLevel];
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
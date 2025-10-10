import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.ssam00.githubgraph.week" })
export class HeatmapWeek extends SingletonAction {

/**
 * Se ejecuta cuando el botón aparece en Stream Deck
 */
override async onWillAppear(ev: WillAppearEvent): Promise<void> {
	// Por ahora, mostrar una imagen de prueba
	await this.updateDisplay(ev.action);
}

/**
 * Se ejecuta cuando presionas el botón
 */
override async onKeyDown(ev: KeyDownEvent): Promise<void> {
	// Mostrar feedback visual
	await ev.action.showOk();
	// Actualizar la imagen (por ahora, la misma)
	await this.updateDisplay(ev.action);
}

/**
 * Método para actualizar la imagen del botón
 */
private async updateDisplay(action: any): Promise<void> {
	// Generar una imagen simple de prueba
	const imageData = this.generateTestImage();
	// Enviar la imagen al botón
	await action.setImage(imageData);
}
/*
 * Genera una imagen de heatmap estilo GitHub
 */
private generateTestImage(): string {
	// Dimensiones fijas del botón Stream Deck
	const canvasSize = 144;

	// Configuración del heatmap
	const cellSize = 22;      // Tamaño de cada celda (cuadrado)
	const gap = 4;            // Espacio entre celdas
	const rows = 2;           // 2 filas
	const maxCols = 4;        // Máximo de columnas (primera fila)

	// Datos simulados para 7 días distribuidos en 2 filas (4+3)
	// Valores: 0 = sin commits, 4 = máximos commits
	const weekData = [
	[1, 2, 3, 4],           // Primera fila: 4 días (L, M, M, J)
	[3, 0, 2]               // Segunda fila: 3 días (V, S, D)
	];

	// Calcular dimensiones de la cuadrícula (basado en la fila más ancha)
	const gridWidth = maxCols * cellSize + (maxCols - 1) * gap;
	const gridHeight = rows * cellSize + (rows - 1) * gap;

	// Centrar toda la cuadrícula en el canvas
	const offsetX = (canvasSize - gridWidth) / 2;
	const offsetY = (canvasSize - gridHeight) / 2;

	// Paleta de colores GitHub (tema oscuro)
	const colors: { [key: number]: string } = {
	0: '#161b22',         // Sin commits
	1: '#0e4429',         // Nivel bajo
	2: '#006d32',         // Nivel medio-bajo
	3: '#26a641',         // Nivel medio-alto
	4: '#39d353',         // Nivel alto
	};

	// Construir SVG con dimensiones exactas
	let svg = `
	<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
		<!-- Fondo oscuro -->
		<rect width="${canvasSize}" height="${canvasSize}" fill="#0d1117"/>
	`;

	// Generar cada celda del heatmap
	for (let row = 0; row < rows; row++) {
	const currentRowData = weekData[row];

	for (let col = 0; col < currentRowData.length; col++) {
		const value = currentRowData[col];
		// Calcular posición (todas las filas alineadas a la izquierda)
		const x = offsetX + col * (cellSize + gap);
		const y = offsetY + row * (cellSize + gap);
		const color = colors[value];
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
	// Convertir a base64
	const base64 = Buffer.from(svg).toString('base64');
return `data:image/svg+xml;base64,${base64}`;
}
}
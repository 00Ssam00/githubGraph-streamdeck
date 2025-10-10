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

/**
 * Genera una imagen de prueba (cuadrado azul)
 */
private generateTestImage(): string {
	// Por ahora, retornamos un SVG simple codificado en base64
	const svg = `
	<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
		<!-- Fondo negro -->
		<rect width="144" height="144" fill="#0d1117"/>
		<!-- Título -->
		<text x="72" y="30" 
			font-family="Arial" 
			font-size="14" 
			fill="#c9d1d9" 
			text-anchor="middle">
		Week Heatmap
		</text>
		<!-- Simulación de 7 cuadrados (7 días) -->
		<rect x="20" y="50" width="15" height="15" fill="#0e4429" rx="2"/>
		<rect x="40" y="50" width="15" height="15" fill="#006d32" rx="2"/>
		<rect x="60" y="50" width="15" height="15" fill="#26a641" rx="2"/>
		<rect x="80" y="50" width="15" height="15" fill="#39d353" rx="2"/>
		<rect x="100" y="50" width="15" height="15" fill="#26a641" rx="2"/>
		<rect x="20" y="70" width="15" height="15" fill="#006d32" rx="2"/>
		<rect x="40" y="70" width="15" height="15" fill="#0e4429" rx="2"/>
		<!-- Etiquetas de días -->
		<text x="27" y="100" font-family="Arial" font-size="8" fill="#8b949e">L</text>
		<text x="47" y="100" font-family="Arial" font-size="8" fill="#8b949e">M</text>
		<text x="67" y="100" font-family="Arial" font-size="8" fill="#8b949e">M</text>
		<text x="87" y="100" font-family="Arial" font-size="8" fill="#8b949e">J</text>
		<text x="107" y="100" font-family="Arial" font-size="8" fill="#8b949e">V</text>
		<text x="27" y="115" font-family="Arial" font-size="8" fill="#8b949e">S</text>
		<text x="47" y="115" font-family="Arial" font-size="8" fill="#8b949e">D</text>
	</svg>
	`;
	// Convertir SVG a base64
	const base64 = Buffer.from(svg).toString('base64');

	// Retornar en formato data URI
	return `data:image/svg+xml;base64,${base64}`;
}
}
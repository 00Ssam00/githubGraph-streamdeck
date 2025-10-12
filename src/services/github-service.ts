import { GitHubResponse, GitHubContributionDay } from "../types/github";

/**
 * Servicio para interactuar con la API de GitHub
 */
export class GitHubService {
    private readonly apiUrl = "https://api.github.com/graphql";
    private token: string;
    constructor(token: string) {
        this.token = token;
    }

    //Obtiene los commits de los últimos 7 días
    async getLastWeekCommits(): Promise<number[]> {
        console.log("🌐 GitHubService: Iniciando petición a API");
        // Zona horaria de Colombia: UTC-5
        const COLOMBIA_OFFSET_HOURS = -5;
        // Obtener fecha y hora ACTUAL en Colombia
        const nowUTC = new Date();
        const nowColombia = new Date(nowUTC.getTime() + COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        console.log("🕐 Hora actual UTC:", nowUTC.toISOString());
        console.log("🕐 Hora actual Colombia:", nowColombia.toISOString());
        // Inicio del día ACTUAL en Colombia (00:00:00)
        const startOfToday = new Date(nowColombia);
        startOfToday.setHours(0, 0, 0, 0);
        // Inicio hace 6 días (para tener exactamente 7 días: hoy + 6 anteriores)
        const startDate = new Date(startOfToday);
        startDate.setDate(startDate.getDate() - 6);
        // CAMBIO: Usar la hora ACTUAL como límite (no el inicio del día siguiente)
        // Esto evita que GitHub incluya el día de mañana
        const endDate = nowColombia;
        // Convertir a UTC para la API de GitHub
        const fromDateUTC = new Date(startDate.getTime() - COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        const toDateUTC = new Date(endDate.getTime() - COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        const fromDate = fromDateUTC.toISOString();
        const toDate = toDateUTC.toISOString();
        console.log("📅 Rango solicitado (Colombia):");
        console.log("  Desde:", startDate.toLocaleString('es-CO'), "(00:00)");
        console.log("  Hasta:", endDate.toLocaleString('es-CO'), "(AHORA)");
        console.log("📅 Rango enviado a API (UTC):");
        console.log("  Desde:", fromDate);
        console.log("  Hasta:", toDate);
        const query = `
            query {
                viewer {
                    contributionsCollection(from: "${fromDate}", to: "${toDate}") {
                        contributionCalendar {
                            weeks {
                                contributionDays {
                                    date
                                    contributionCount
                                }
                            }
                        }
                    }
                }
            }
        `;
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ GitHub API error:", response.status, errorText);
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const data = await response.json() as GitHubResponse;
            const extractedData = this.extractLastSevenDays(data);
            console.log("✅ Datos de commits por día (7 días):", extractedData);
            console.log("📊 Total commits:", extractedData.reduce((a, b) => a + b, 0));
            return extractedData;
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            return [0, 0, 0, 0, 0, 0, 0];
        }
    }

    //Extrae los últimos 7 días de la respuesta
    private extractLastSevenDays(response: GitHubResponse): number[] {
    const calendar = response.data.viewer.contributionsCollection.contributionCalendar;
    const allDays: GitHubContributionDay[] = [];
    calendar.weeks.forEach(week => {
        allDays.push(...week.contributionDays);
    });
    const lastSevenDays = allDays.slice(-7);
    return lastSevenDays.map(day => day.contributionCount);
    }
}
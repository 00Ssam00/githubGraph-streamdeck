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

    // 🔧 Ajuste de zona horaria: convierte fecha UTC a hora local de Bogotá (UTC-5)
    private adjustToBogotaDate(dateString: string): string {
        // Si es solo una fecha (YYYY-MM-DD), ya está en el formato correcto
        // porque GitHub devuelve las fechas de contribución en la zona local del usuario
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            console.log(`🔄 Fecha ya procesada: ${dateString} (Colombia)`);
            return dateString;
        }
        // Si tiene hora (ISO 8601), convertir de UTC a Colombia
        const date = new Date(dateString);
        // Convertir a milisegundos en zona horaria de Colombia (UTC-5)
        const COLOMBIA_OFFSET_MS = -5 * 60 * 60 * 1000;
        const colombiaTime = new Date(date.getTime() + COLOMBIA_OFFSET_MS);
        // Extraer año, mes, día en Colombia
        const year = colombiaTime.getUTCFullYear();
        const month = String(colombiaTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(colombiaTime.getUTCDate()).padStart(2, '0');
        const localDateKey = `${year}-${month}-${day}`;
        console.log(`🔄 Conversión: ${dateString} (UTC) -> ${localDateKey} (Colombia)`);
        return localDateKey;
    }

    // Obtiene los commits de los últimos 7 días
    async getLastWeekCommits(): Promise<number[]> {
        console.log("🌐 GitHubService: Iniciando petición a API");

        // Zona horaria de Colombia: UTC-5
        const COLOMBIA_OFFSET_HOURS = -5;

        // Obtener fecha y hora actual en Colombia
        const nowUTC = new Date();
        const nowColombia = new Date(nowUTC.getTime() + COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        console.log("🕐 Hora actual UTC:", nowUTC.toISOString());
        console.log("🕐 Hora actual Colombia:", nowColombia.toISOString());

        // Inicio del día actual en Colombia (00:00:00)
        const startOfToday = new Date(nowColombia);
        startOfToday.setHours(0, 0, 0, 0);

        // Inicio hace 6 días (para tener exactamente 7 días: hoy + 6 anteriores)
        const startDate = new Date(startOfToday);
        startDate.setDate(startDate.getDate() - 6);

        // Usar la hora actual como límite (no el inicio del día siguiente)
        const endDate = nowColombia;

        // Convertir a UTC para la API de GitHub
        const fromDateUTC = new Date(startDate.getTime() - COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        const toDateUTC = new Date(endDate.getTime() - COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);

        const fromDate = fromDateUTC.toISOString();
        const toDate = toDateUTC.toISOString();

        console.log("📅 Rango solicitado (Colombia):");
        console.log(`  Desde: ${startDate.toLocaleString('es-CO')} (00:00)`);
        console.log(`  Hasta: ${endDate.toLocaleString('es-CO')} (AHORA)`);
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
            const extractedData = this.extractLastSevenDays(data, startDate, endDate);

            console.log("✅ Datos de commits por día (7 días):", extractedData);
            console.log("📊 Total commits:", extractedData.reduce((a, b) => a + b, 0));
            return extractedData;
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            return [0, 0, 0, 0, 0, 0, 0];
        }
    }

    /**
     * Obtiene los commits de los últimos 30 días
     */
    async getLastMonthCommits(): Promise<number[]> {
        console.log("🌐 GitHubService: Iniciando petición a API (30 días)");
        const COLOMBIA_OFFSET_HOURS = -5;
        const nowUTC = new Date();
        const nowColombia = new Date(nowUTC.getTime() + COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        console.log("🕐 Hora actual Colombia:", nowColombia.toISOString());

        const startOfToday = new Date(nowColombia);
        startOfToday.setHours(0, 0, 0, 0);

        // Inicio hace 29 días (para tener 30 días: hoy + 29 anteriores)
        const startDate = new Date(startOfToday);
        startDate.setDate(startDate.getDate() - 29);

        const endDate = nowColombia;

        // Convertir a UTC para la API
        const fromDateUTC = new Date(startDate.getTime() - COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);
        const toDateUTC = new Date(endDate.getTime() - COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000);

        const fromDate = fromDateUTC.toISOString();
        const toDate = toDateUTC.toISOString();

        console.log("📅 Rango (30 días):");
        console.log("  Desde:", startDate.toLocaleString('es-CO'));
        console.log("  Hasta:", endDate.toLocaleString('es-CO'));

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
            const extractedData = this.extractLastThirtyDays(data, startDate, endDate);

            console.log("✅ Datos de commits (30 días):", extractedData);
            console.log("📊 Total commits:", extractedData.reduce((a, b) => a + b, 0));

            return extractedData;
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            // Retornar array vacío de 30 días
            return Array(30).fill(0);
        }
    }

    /**
     * Extrae los últimos 30 días de la respuesta
     */
    private extractLastThirtyDays(response: GitHubResponse, startDateColombia: Date, endDateColombia: Date): number[] {
        const calendar = response.data.viewer.contributionsCollection.contributionCalendar;
        const allDays: GitHubContributionDay[] = [];
        calendar.weeks.forEach(week => {
            allDays.push(...week.contributionDays);
        });
        // Construir mapa: fecha local (YYYY-MM-DD Bogotá) -> commits
        const mapByLocalDate: Record<string, number> = {};
        allDays.forEach(day => {
            const localKey = this.adjustToBogotaDate(day.date);
            mapByLocalDate[localKey] = (mapByLocalDate[localKey] || 0) + day.contributionCount;
        });
        // Generar array de 30 días
        const result: number[] = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date(startDateColombia);
            d.setDate(startDateColombia.getDate() + i);
            const key = this.adjustToBogotaDate(d.toISOString());
            const count = mapByLocalDate[key] || 0;
            result.push(count);
        }
        return result;
    }

    // Extrae los últimos 7 días de la respuesta (corrige el desfase de día)
    private extractLastSevenDays(response: GitHubResponse, startDateColombia: Date, endDateColombia: Date): number[] {
        const calendar = response.data.viewer.contributionsCollection.contributionCalendar;
        const allDays: GitHubContributionDay[] = [];

        calendar.weeks.forEach(week => {
            allDays.push(...week.contributionDays);
        });

        // Construir mapa: fecha local (YYYY-MM-DD Bogotá) -> commits
        const mapByLocalDate: Record<string, number> = {};
        allDays.forEach(day => {
            const localKey = this.adjustToBogotaDate(day.date);
            mapByLocalDate[localKey] = (mapByLocalDate[localKey] || 0) + day.contributionCount;
        });

        console.log("🔁 Mapa de commits por fecha (Bogotá):", mapByLocalDate);

        // Generar array en orden desde startDateColombia hasta endDateColombia (7 días)
        const result: number[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDateColombia);
            d.setDate(startDateColombia.getDate() + i);
            const key = this.adjustToBogotaDate(d.toISOString());
            const count = mapByLocalDate[key] || 0;
            console.log(`📆 Día ${i}: ${key} -> ${count}`);
            result.push(count);
        }

        return result;
    }
}

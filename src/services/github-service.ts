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

    /**
     * Obtiene los commits de los últimos 7 días
     */
    async getLastWeekCommits(): Promise<number[]> {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        // Inicio hace 6 días (para tener exactamente 7 días: hoy + 6 anteriores)
        const startDate = new Date(startOfToday);
        startDate.setDate(startDate.getDate() - 6);

        const fromDate = startDate.toISOString();
        const toDate = now.toISOString();

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
            const extractedData = this.extractDays(data, startDate, 7);

            console.log("✅ Commits últimos 7 días:", extractedData);
            console.log("📊 Total commits:", extractedData.reduce((a, b) => a + b, 0));
            return extractedData;
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            return Array(7).fill(0);
        }
    }

    /**
     * Obtiene los commits de los últimos 30 días
     */
    async getLastMonthCommits(): Promise<number[]> {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        // Inicio hace 29 días (para tener 30 días: hoy + 29 anteriores)
        const startDate = new Date(startOfToday);
        startDate.setDate(startDate.getDate() - 29);

        const fromDate = startDate.toISOString();
        const toDate = now.toISOString();

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
            const extractedData = this.extractDays(data, startDate, 30);

            console.log("✅ Commits últimos 30 días:", extractedData);
            console.log("📊 Total commits:", extractedData.reduce((a, b) => a + b, 0));
            return extractedData;
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            return Array(30).fill(0);
        }
    }

    /**
     * Extrae los últimos N días de la respuesta
     */
    private extractDays(response: GitHubResponse, startDate: Date, numDays: number): number[] {
        const calendar = response.data.viewer.contributionsCollection.contributionCalendar;

        // Recopilar todos los días de todas las semanas
        const allDays: GitHubContributionDay[] = [];
        calendar.weeks.forEach(week => {
            allDays.push(...week.contributionDays);
        });

        // Crear mapa: fecha (YYYY-MM-DD) -> cantidad de commits
        const commitsByDate: Record<string, number> = {};
        allDays.forEach(day => {
            commitsByDate[day.date] = day.contributionCount;
        });

        // Generar array con las fechas esperadas
        const result: number[] = [];
        for (let i = 0; i < numDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            // Formato YYYY-MM-DD
            const dateKey = date.toISOString().split('T')[0];
            const count = commitsByDate[dateKey] || 0;
            result.push(count);
        }

        return result;
    }
}
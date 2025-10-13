// Tipos para la API de Github
export interface GitHubContributionDay {
    date: string;
    contributionCount: number;
}

export interface GitHubContributionWeek {
    contributionDays: GitHubContributionDay[];
}

export interface GitHubContributionCalendar {
    weeks: GitHubContributionWeek[];
}

export interface GitHubResponse {
    data: {
        viewer: {
            contributionsCollection: {
                contributionCalendar: GitHubContributionCalendar;
            };
        };
    };
}
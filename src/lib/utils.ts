export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (...)'; // Full UA string

export function formatUrl(templateUrl: string, targetUsername: string): string {
    return templateUrl.replace('{}', encodeURIComponent(targetUsername));
}

// Add other pure utility functions if needed
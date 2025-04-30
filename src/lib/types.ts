// Example structure
export interface CookieConfig { /* Add properties based on data.json */ }
export interface WebsiteConfig {
    name: string;
    base_url: string;
    // Add other properties from the original GoSearch data.json if needed
    errorType?: string; // Added based on websiteChecker usage
    errorText?: string; // Added based on websiteChecker usage
    successText?: string; // Added based on websiteChecker usage
    // Add other properties as needed from data.json
}
export interface ConfigData {
    websites: WebsiteConfig[];
    // Add other properties from the original GoSearch data.json if needed
}
// ... other interfaces for API responses ...

// Minimal placeholder for HudsonRock API response type
export interface HudsonRockApiResponse {
    stealers?: any[]; // Assuming it has a 'stealers' array
    // Add other properties as needed
}

// Interface for a single breach entry from BreachDirectory
export interface BreachEntry {
    email?: string; // Optional as sometimes only username/hash is present
    password?: string;
    sha1?: string;
    hash?: string;
    sources?: string;
}

// Minimal placeholder for BreachDirectory API config and response types
export interface BreachDirectoryConfig { apiKey: string; } // Added apiKey based on usage
export interface BreachDirectoryResponse {
    found: number; // Assuming it has a 'found' count
    result?: BreachEntry[]; // Array of breach entries
    // Add other properties as needed
}

// Minimal placeholder for ProxyNova API response type
export interface ProxyNovaApiResponse {
    found: number; // Assuming it has a 'found' count
    // Add other properties as needed
}

// Interface for structured results from the engine
export interface CheckResult {
    siteName: string;
    profileUrl: string;
    status: 'found' | 'uncertain' | 'not_found' | 'error';
    error?: string; // Optional error message
}

export interface ApiCheckResult {
    service: string;
    status: 'checked' | 'skipped' | 'error';
    found: boolean;
    details?: any; // Structure based on API
    error?: string;
}

// Interface for the overall results from the engine
export interface BreachHoundResults {
    websiteResults: CheckResult[];
    hudsonRockResult: ApiCheckResult;
    breachDirectoryResult: ApiCheckResult;
    proxyNovaResult: ApiCheckResult;
    domainCheckResult: ApiCheckResult;
    summary: {
        profilesFound: number;
        durationSeconds: number;
    };
}

// Interface for configuration passed to the engine
export interface BreachHoundConfig {
    breachDirectoryApiKey?: string;
    hudsonRockApiKey?: string; // Add optional key for HudsonRock
    // Add other API keys here if needed
}
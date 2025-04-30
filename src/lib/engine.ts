import { performance } from 'perf_hooks';
import { fetchWebsiteConfig } from './config';
import { checkWebsitePresence } from './websiteChecker';
import * as Api from './api'; // Import all API functions
import { checkDomains } from './domainChecker';
import { BreachHoundConfig, BreachHoundResults, ConfigData } from './types';

export async function runChecks(
    targetUsername: string,
    config: BreachHoundConfig = {} // Accept API keys etc.
): Promise<BreachHoundResults | null> {
    const startTime = performance.now();

    const siteConfigData = await fetchWebsiteConfig();
    if (!siteConfigData?.websites) {
        console.error("Failed to load website configuration.");
        return null; // Indicate failure
    }

    // --- Website Checks ---
    const websiteCheckPromises = siteConfigData.websites.map(site =>
        checkWebsitePresence(site, targetUsername)
    );
    const websiteSettledResults = await Promise.allSettled(websiteCheckPromises);
    const websiteResults = websiteSettledResults.map(result =>
        result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason?.message || 'Unknown check error' } as any // Handle rejected promises
    );

    // --- Sequential API Checks ---
    const hudsonRockResult = await Api.checkHudsonRock(targetUsername, config.hudsonRockApiKey); // Pass API key
    const breachDirectoryResult = await Api.checkBreachDirectory(targetUsername, config.breachDirectoryApiKey);
    const proxyNovaResult = await Api.checkProxyNova(targetUsername);
    const domainCheckResult = await checkDomains(targetUsername);

    const endTime = performance.now();
    const durationSeconds = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    const profilesFound = websiteResults.filter(r => r.status === 'found' || r.status === 'uncertain').length;

    return {
        websiteResults,
        hudsonRockResult,
        breachDirectoryResult,
        proxyNovaResult,
        domainCheckResult,
        summary: {
            profilesFound: profilesFound,
            durationSeconds: durationSeconds,
        },
    };
}
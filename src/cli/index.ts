#!/usr/bin/env node
// Shebang makes it executable

import dotenv from 'dotenv';
import path from 'path';
import { parseArguments } from './args';
import { printHeader, displayResults, deleteOldFile } from './ui';
import { runChecks } from '../lib'; // Import the main engine function
import { fetchWebsiteConfig } from '../lib/config'; // Need this for site count

// Load .env file variables into process.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    const args = await parseArguments();

    // Get API keys from environment variables (prefer env over args if both exist?)
    // Or prioritize args? Let's prioritize args if provided, else fallback to env.
    const breachDirectoryApiKey = args.breachDirectoryApiKey || process.env.BREACH_DIRECTORY_API_KEY;
    // Add other API keys if needed

    await deleteOldFile(args.targetUsername);

    // Fetch config early to get site count for header
    const siteConfigData = await fetchWebsiteConfig();
    const siteCount = siteConfigData?.websites?.length ?? 0;

    printHeader(args.targetUsername, siteCount, {
        hideFalsePositives: args.hideFalsePositives,
        breachDirectoryEnabled: !!breachDirectoryApiKey
    });

    if (siteCount === 0) {
        console.error("Exiting: Could not load website configuration.");
        return;
    }

    const results = await runChecks(args.targetUsername, {
        breachDirectoryApiKey: breachDirectoryApiKey,
        // Pass other keys if needed
    });

    if (results) {
        await displayResults(results, args.targetUsername, args.hideFalsePositives);
    } else {
        console.error("BreachHound checks failed to complete.");
    }
}

main().catch(error => {
    console.error("\n[-] An unexpected error occurred:", error);
    process.exit(1);
});

main().catch(error => {
    console.error("\n[-] An unexpected error occurred:", error);
    process.exit(1);
});
import * as readline from 'readline';
import chalk from 'chalk';
import { runChecks, BreachHoundConfig } from '../src/lib'; // Import from the library source
import { fetchWebsiteConfig } from '../src/lib/config'; // Need this for site count and header
import { printHeader, displayResults, deleteOldFile, ASCII_ART, VERSION } from '../src/cli/ui'; // Import UI functions

// Load environment variables if needed (for API keys)
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runInteractiveTest() {
    // Get API keys from environment variables
    const breachDirectoryApiKey = process.env.BREACH_DIRECTORY_API_KEY;
    const hudsonRockApiKey = process.env.HUDSON_ROCK_API_KEY; // Load HudsonRock key
    // Add other API keys if needed

    // Fetch config early to get site count for header
    const siteConfigData = await fetchWebsiteConfig();
    const siteCount = siteConfigData?.websites?.length ?? 0;

    if (siteCount === 0) {
        console.error("Exiting: Could not load website configuration.");
        process.exit(1); // Exit if config loading fails
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("BreachHound Interactive Test App");
    console.log("Enter a username to search, or type '/exit' to quit.");
    console.log(chalk.grey('⎯'.repeat(60)));


    while (true) {
        const username = await new Promise<string>(resolve => {
            rl.question('Enter username: ', resolve);
        });

        if (username.toLowerCase() === '/exit') {
            rl.close();
            break;
        }

        if (username.trim() === '') {
            console.log(chalk.yellow("Please enter a valid username."));
            continue;
        }

        // Use imported UI functions
        printHeader(username, siteCount, {
            hideFalsePositives: false, // Or add an option to the test app
            breachDirectoryEnabled: !!breachDirectoryApiKey
        });

        await deleteOldFile(username);

        console.log(chalk.cyan('\n[*] Running checks... Please wait.')); // Add progress indicator

        const config: BreachHoundConfig = {
            breachDirectoryApiKey: breachDirectoryApiKey,
            hudsonRockApiKey: hudsonRockApiKey, // Pass HudsonRock key
            // Pass other keys if needed
        };

        const results = await runChecks(username, config);

        console.log(chalk.cyan('[*] Checks complete. Displaying results...')); // Add completion indicator

        if (results) {
            // Use imported UI functions
            await displayResults(results, username, false); // Or pass hideFalsePositives option
        } else {
            console.error("BreachHound checks failed to complete.");
        }
        console.log(chalk.grey('⎯'.repeat(60))); // Separator between checks
    }
    process.exit(0); // Exit after interactive mode
}

runInteractiveTest().catch(error => {
    console.error("\n[-] An unexpected error occurred:", error);
    process.exit(1);
});
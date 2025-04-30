import chalk from 'chalk';
import * as fs from 'fs/promises';
import { BreachHoundResults, CheckResult, ApiCheckResult } from '../lib/types'; // Import result types

export const ASCII_ART = `...`; // Your ASCII art
export const VERSION = '1.0.0'; // Keep version consistent or read from package.json

export function printHeader(username: string, siteCount: number, options: { hideFalsePositives: boolean, breachDirectoryEnabled: boolean }) {
    console.clear();
    console.log(chalk.blue(ASCII_ART));
    console.log(`BreachHound ${VERSION} - TypeScript Port`);
    console.log(chalk.grey('⎯'.repeat(60)));
    console.log(`:: Target Username   : ${chalk.cyan(username)}`);
    console.log(`:: Websites to Check : ${siteCount}`);
    if (options.hideFalsePositives) console.log(`:: Hide Uncertain    : ${chalk.yellow('Yes')}`);
    if (options.breachDirectoryEnabled) console.log(`:: BreachDirectory   : ${chalk.green('Enabled')}`);
    console.log(chalk.grey('⎯'.repeat(60)));
    if (!options.hideFalsePositives) {
        console.log(chalk.yellow('[!] Yellow [?] links indicate uncertainty about the profile\'s existence.\n'));
    }
}

export async function appendToFile(targetUsername: string, content: string): Promise<void> {
    // ... (implementation as before) ...
    const filePath = `${targetUsername}.txt`;
    try {
        await fs.appendFile(filePath, content + '\n', 'utf8');
    } catch (error) {
        console.error(chalk.red(`[-] Error writing to file ${filePath}: ${error}`));
    }
}

export async function deleteOldFile(targetUsername: string): Promise<void> {
    // ... (implementation as before) ...
     const filePath = `${targetUsername}.txt`;
     try {
         await fs.unlink(filePath);
         // console.log(chalk.grey(`[*] Deleted old results file: ${filePath}`)); // Optional: log deletion
     } catch (error: any) {
         if (error.code !== 'ENOENT') { // Ignore error if file doesn't exist
             console.error(chalk.red(`[-] Error deleting old results file ${filePath}: ${error}`));
         }
     }
}

export async function displayResults(results: BreachHoundResults, username: string, hideFalsePositives: boolean) {
    // --- Website Results ---
    console.log(chalk.yellow(`\n[*] Website Scan Results:`));
    results.websiteResults.forEach(res => {
        if (res.status === 'found') {
            const line = `[+] ${res.siteName}: ${res.profileUrl}`;
            console.log(chalk.green(line));
            appendToFile(username, line);
        } else if (res.status === 'uncertain' && !hideFalsePositives) {
            const line = `[?] ${res.siteName}: ${res.profileUrl}`;
            console.log(chalk.yellow(line));
            appendToFile(username, `[?] ${line}`); // Add prefix to file too
        } else if (res.status === 'error') {
            // Optional: log errors verbosely if needed
            // console.error(chalk.red(`[-] Error checking ${res.siteName}: ${res.error}`));
        }
    });

    // --- API Results ---
    await displayApiResult(results.hudsonRockResult, username);
    await displayApiResult(results.breachDirectoryResult, username);
    await displayApiResult(results.proxyNovaResult, username);
    await displayApiResult(results.domainCheckResult, username);


    // --- Summary ---
    console.log(chalk.grey('⎯'.repeat(60)));
    const summaryLines = [
        `:: Profiles Found / Uncertain : ${results.summary.profilesFound}`,
        `:: Total Time Taken           : ${results.summary.durationSeconds} seconds`,
        `:: Report saved to            : ${username}.txt`
    ];
    summaryLines.forEach(line => console.log(line));
    await appendToFile(username, '\n' + chalk.grey('⎯'.repeat(60)) + '\n' + summaryLines.join('\n'));
    console.log(chalk.grey('⎯'.repeat(60)));
}


// Helper to display formatted API results
async function displayApiResult(result: ApiCheckResult, username: string) {
    console.log(chalk.grey('⎯'.repeat(60)));
    console.log(chalk.yellow(`[*] ${result.service} Results:`));

    if (result.status === 'skipped') {
        const msg = `:: ${result.service} check skipped (API key may be missing).`;
        console.log(chalk.grey(msg));
        await appendToFile(username, `\n--- ${result.service} Check ---`);
        await appendToFile(username, msg);
        return;
    }
    await appendToFile(username, `\n--- ${result.service} Check ---`);

    if (result.status === 'error') {
        const msg = `:: Error querying ${result.service}: ${result.error}`;
        console.error(chalk.red(msg));
        await appendToFile(username, msg);
        return;
    }

    // Add specific formatting based on result.service and result.details
    // Example for HudsonRock:
    if (result.service === 'HudsonRock') {
        const data = result.details as any; // Use any for now, define specific type later
        if (result.found && data?.stealers) {
            // ... (detailed printing logic for stealers as before) ...
            const msg = ":: This username is associated with a computer infected by an info-stealer.";
             console.log(chalk.red(msg));
             await appendToFile(username, msg);
             // ... loop through stealers, print details ...
        } else {
             const msg = ":: This username is not associated with a computer infected by an info-stealer.";
             console.log(chalk.green(msg));
             await appendToFile(username, msg);
        }
    }
     // Formatting for BreachDirectory:
     else if (result.service === 'BreachDirectory') {
         if (result.found && result.details?.breaches?.length > 0) {
             const count = result.details.foundCount || result.details.breaches.length;
             const msg = `[+] Found ${count} breach entries:`;
             console.log(chalk.green(msg));
             await appendToFile(username, msg);

             // Loop through breach entries and print details
             for (const entry of result.details.breaches) {
                 let passMsg = '';
                 if (entry.crackedPassword) {
                     passMsg = `[+] Password (Cracked): ${entry.crackedPassword}`;
                 } else if (entry.password) {
                     passMsg = `[+] Password: ${entry.password}`;
                 } else {
                     passMsg = `[?] Password: Not Available`;
                 }
                 console.log(chalk.green(passMsg));
                 await appendToFile(username, passMsg);

                 if (entry.email) {
                     const emailMsg = `[+] Email: ${entry.email}`;
                     console.log(chalk.green(emailMsg));
                     await appendToFile(username, emailMsg);
                 }
                 if (entry.hash) {
                     const hashMsg = `[+] Hash: ${entry.hash}`;
                     console.log(chalk.grey(hashMsg)); // Use grey for hash
                     await appendToFile(username, hashMsg);
                 }
                 if (entry.sha1) {
                     const sha1Msg = `[+] SHA1: ${entry.sha1}`;
                     console.log(chalk.grey(sha1Msg)); // Use grey for hash
                     await appendToFile(username, sha1Msg);
                 }
                 if (entry.source) {
                     const sourceMsg = `[+] Source: ${entry.source}`;
                     console.log(chalk.green(sourceMsg));
                     await appendToFile(username, sourceMsg);
                 }
                 console.log(''); // Add a blank line between entries
                 await appendToFile(username, '');
             }
         } else {
             const msg = `[-] No breaches found.`;
             console.log(chalk.red(msg)); // Use red for "not found"
             await appendToFile(username, msg);
         }
     }
     // Formatting for ProxyNova
     else if (result.service === 'ProxyNova') {
         if (result.found && result.details) {
             // Assuming details contains info like count or entries
             const count = result.details.found || (Array.isArray(result.details.entries) ? result.details.entries.length : 0);
             const msg = `[+] Found ${count} potential credential leak(s) in Comb DB.`;
             console.log(chalk.green(msg));
             await appendToFile(username, msg);
             // Optionally loop through result.details.entries if they exist and print them
         } else {
             const msg = `[-] No potential credential leaks found in Comb DB.`;
             console.log(chalk.red(msg));
             await appendToFile(username, msg);
         }
     }
     // Formatting for DomainCheck
     else if (result.service === 'DomainCheck') {
         if (result.found && result.details?.found?.length > 0) {
             const foundDomains = result.details.found.join(', ');
             const msg = `[+] Found potentially available domains: ${foundDomains}`;
             console.log(chalk.green(msg));
             await appendToFile(username, msg);
         } else {
             const msg = `[-] No potentially available domains found matching the username.`;
             console.log(chalk.red(msg));
             await appendToFile(username, msg);
         }
     }
}
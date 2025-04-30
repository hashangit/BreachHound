import axios from 'axios';
import { ApiCheckResult, BreachDirectoryConfig, BreachDirectoryResponse, BreachEntry } from '../types'; // Assuming BreachDirectoryConfig includes apiKey
import { DEFAULT_USER_AGENT } from '../utils';
import { crackPasswordHash } from './weakpass'; // Import cracking function

export async function checkBreachDirectory(
    targetUsername: string,
    apiKey: string | undefined
): Promise<ApiCheckResult> {
    if (!apiKey) {
        return { service: 'BreachDirectory', status: 'skipped', found: false };
    }
    // Construct the correct API URL for BreachDirectory via RapidAPI
    const url = `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(targetUsername)}`;
    try {
        const response = await axios.get<BreachDirectoryResponse>(url, {
            headers: {
                'x-rapidapi-host': 'breachdirectory.p.rapidapi.com',
                'x-rapidapi-key': apiKey, // Use the provided API key
                'User-Agent': DEFAULT_USER_AGENT
            },
            timeout: 20000, // Allow a slightly longer timeout
        });

        const found = response.data.found > 0;
        let structuredDetails: any = {
            foundCount: response.data.found || 0,
            breaches: [] // Initialize an array to hold breach details
        };

        if (found && response.data.result) {
            const breachPromises = response.data.result.map(async (entry: BreachEntry) => { // Explicitly type entry
                const hashToCrack = entry.hash || entry.sha1; // Prefer hash, fallback to sha1
                let crackedPassword: string | null = null;
                if (hashToCrack) { // Only crack if a hash exists
                    crackedPassword = await crackPasswordHash(hashToCrack);
                }
                return {
                    email: entry.email,
                    password: entry.password, // Original password from breach
                    crackedPassword: crackedPassword, // Result from Weakpass
                    source: entry.sources,
                    hash: entry.hash,
                    sha1: entry.sha1,
                };
            });
            structuredDetails.breaches = await Promise.all(breachPromises);
        }

        return {
            service: 'BreachDirectory',
            status: 'checked',
            found: found,
            details: structuredDetails,
        };
    } catch (error: any) {
         return {
             service: 'BreachDirectory',
             status: 'error',
             found: false,
             error: error.message,
         };
    }
}
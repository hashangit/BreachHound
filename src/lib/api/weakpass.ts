import axios from 'axios';
import { DEFAULT_USER_AGENT } from '../utils';

interface WeakpassResponse {
    found: boolean;
    type?: string;
    hash?: string;
    pass?: string;
}

/**
 * Attempts to crack a password hash using the Weakpass API.
 * @param hash The hash string to crack.
 * @returns The cracked password string or null if not found or an error occurred.
 */
export async function crackPasswordHash(hash: string): Promise<string | null> {
    if (!hash) {
        return null; // Don't attempt to crack empty hashes
    }
    // Weakpass API endpoint structure
    const url = `https://weakpass.com/api/v1/search/${encodeURIComponent(hash)}.json`;

    try {
        const response = await axios.get<WeakpassResponse>(url, {
            headers: {
                'User-Agent': DEFAULT_USER_AGENT,
                'Accept': 'application/json'
            },
            timeout: 10000, // Timeout for Weakpass API
            // Weakpass might return 404 if hash not found, treat as not cracked
            validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
        });

        if (response.status === 200 && response.data?.found && response.data.pass) {
            return response.data.pass; // Return cracked password
        }
        return null; // Hash not found or response malformed
    } catch (error: any) {
        // Log error internally? For now, just return null on error.
        return null;
    }
}
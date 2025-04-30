# BreachHound

[![npm version](https://badge.fury.io/js/breachhound.svg)](https://badge.fury.io/js/breachhound)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
<!-- Add other badges like build status, code coverage if you set them up -->

BreachHound is an efficient Open Source Intelligence (OSINT) tool designed for uncovering digital footprints associated with a given username across numerous online platforms.

## Origin and Credit

BreachHound is a **TypeScript port** of the excellent Go-based tool **[GoSearch](https://github.com/ibnaleem/gosearch)**.

**We extend our sincere gratitude and credit to [Shaffan](https://github.com/ibnaleem), the original developer of GoSearch.** BreachHound aims to provide the same core functionality within the Node.js ecosystem, leveraging the foundation laid by GoSearch. Thank you, Shaffan, for creating and sharing GoSearch!

## Features

*   **Extensive Platform Coverage:** Searches hundreds of websites (dynamically updated from GoSearch's config).
*   **Fast & Concurrent:** Leverages asynchronous operations in Node.js for speed.
*   **API Integrations:**
    *   Checks [HudsonRock's Cybercrime Intelligence Database](https://www.hudsonrock.com/free-tools) for info-stealer infections linked to the username.
    *   Searches [BreachDirectory.org](https://breachdirectory.org/) for compromised credentials (requires API key).
    *   (If BreachDirectory finds hashes) Attempts to crack hashes using the [Weakpass API](https://weakpass.com/).
    *   Queries [ProxyNova's Comb DB](https://api.proxynova.com/comb) for publicly leaked credentials.
*   **Domain Availability:** Checks common TLDs for domain registration matching the username.
*   **Clear Output:** Color-coded terminal output and results saved to a text file (`<username>.txt`).
*   **Flexible Usage:** Can be used as a command-line tool or integrated as a library into other JavaScript/TypeScript projects.
*   **Configurable:** Handles potential false positives and uses external API keys via environment variables.

## Installation

### Using the Command Line Tool

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (Version 16 or higher recommended)
*   npm (usually included with Node.js)

**Install Globally:**
```bash
npm install -g @your-npm-username/breachhound
```
Now you can run `breachhound` from anywhere.

**OR Run Directly with npx (No Installation Needed):**
```bash
# Replace @your-npm-username with your actual npm scope or desired package name
npx @your-npm-username/breachhound -u <username> [options]
```

### Integrating as a Library

```bash
# Replace @your-npm-username with your actual npm scope or desired package name
npm install @your-npm-username/breachhound
# or
yarn add @your-npm-username/breachhound
```

## Usage

### Command Line

```bash
breachhound -u <username> [options]
# or positional username:
breachhound <username> [options]
```

**Options:**

*   `-u, --username <username>`: The username to search for (required if not provided positionally).
*   `-b, --breach-directory-key <key>`: Your API key from [RapidAPI for BreachDirectory](https://rapidapi.com/rohan-patra/api/breachdirectory/) to enable breach checks.
*   `--no-false-positives`: Hide uncertain results (marked with `[?]` and colored yellow).
*   `-h, --help`: Show help message.
*   `--version`: Show version number.

**Examples:**

```bash
# Basic search
breachhound johndoe

# Search with BreachDirectory check (API key set in .env or passed via -b)
breachhound -u janedoe -b YOUR_API_KEY

# Search and hide uncertain results
breachhound -u testuser --no-false-positives
```

### Library Usage (JavaScript/TypeScript)

```typescript
// Replace @your-npm-username with your actual npm scope or desired package name
import { runChecks, BreachHoundConfig } from '@your-npm-username/breachhound';

async function findUser(username: string) {
  console.log(`Starting checks for: ${username}`);

  // API keys can be passed in the config object
  const config: BreachHoundConfig = {
    breachDirectoryApiKey: process.env.BREACH_DIRECTORY_API_KEY, // Load from env or elsewhere
    hudsonRockApiKey: process.env.HUDSON_ROCK_API_KEY, // Load HudsonRock key
    // Add other API keys here if needed
  };

  const results = await runChecks(username, config);

  if (results) {
    console.log('--- Website Results ---');
    results.websiteResults.forEach(site => {
      if (site.status === 'found') {
        console.log(`Found: ${site.siteName} - ${site.profileUrl}`);
      } else if (site.status === 'uncertain') {
        console.log(`Uncertain: ${site.siteName} - ${site.profileUrl}`);
      }
    });

    console.log('\n--- API Check Summary ---');
    console.log(`HudsonRock Found: ${results.hudsonRockResult.found}`);
    console.log(`BreachDirectory Found: ${results.breachDirectoryResult.found}`);
    console.log(`ProxyNova Found: ${results.proxyNovaResult.found}`);
    console.log(`Domains Found: ${results.domainCheckResult.found} (${results.domainCheckResult.details?.found?.join(', ')})`);


    console.log(`\nSummary: Found ${results.summary.profilesFound} profiles in ${results.summary.durationSeconds}s`);
  } else {
    console.error('BreachHound checks failed.');
  }
}

// Example call
findUser('some_username_here');

```

## API Key Setup (Important!)

BreachHound uses external APIs that may require API keys for full functionality.

1.  **Obtain Keys:**
    *   **BreachDirectory:** Get a key from [RapidAPI](https://rapidapi.com/rohan-patra/api/breachdirectory/).
2.  **Set Environment Variables:**
    *   Create a file named `.env` in the root of your project (if using the library) or in the directory where you run the `breachhound` command (if installed globally, setting system-wide env variables is another option).
    *   Add your keys to the `.env` file, following the format in `.env.example`:
        ```dotenv
        BREACH_DIRECTORY_API_KEY=YOUR_RAPIDAPI_KEY_HERE
        ```
    *   The CLI tool will automatically load variables from a `.env` file in the current working directory.
    *   Alternatively, you can pass the BreachDirectory key directly using the `-b` flag.
    *   **HudsonRock:** Add your API key for HudsonRock if required by the endpoint (check their documentation). Add it to your `.env` file as `HUDSON_ROCK_API_KEY=YOUR_HUDSONROCK_API_KEY_HERE`.

**Note:** Ensure the `.env` file is added to your `.gitignore` file to avoid committing your secret keys.

## Publishing to GitHub and npm

Follow these steps to publish BreachHound:

1.  **Code Cleanup:** Remove any debug `console.log` or `console.error` statements you added during development.
2.  **Update `package.json`:**
   *   Ensure `name`, `version`, `repository`, `author`, `bugs`, and `homepage` fields are correct.
   *   Add a `files` array to specify which files to include in the npm package (e.g., `["dist", "README.md", "LICENSE", "package.json"]`).
3.  **Create `.npmignore`:** Create a `.npmignore` file in the project root to explicitly exclude files like `src/`, `test/`, `.env`, etc.
4.  **Add `LICENSE` File:** Create a `LICENSE` file in the project root and paste the full text of the GPL-3.0 license into it.
5.  **Build:** Run `npm run build` to compile your TypeScript code.
6.  **Local Test:** Run `npm pack` to create a `.tgz` file, then install and test it locally (`npm install -g ./your-package.tgz`).
7.  **GitHub:** Initialize a Git repository, add files (ensure `.gitignore` is correct), commit, and push to your GitHub repository.
8.  **npm Login:** Run `npm login` in your terminal.
9.  **Publish:** Run `npm publish --access public`.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

Areas for contribution include:
*   Improving detection logic.
*   Adding support for more websites (requires contributing to the upstream GoSearch `data.json` primarily).
*   Enhancing error handling.
*   Adding tests.
*   Improving documentation.

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details. This matches the license of the original GoSearch project.
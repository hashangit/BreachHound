import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export async function parseArguments() {
    const argv = await yargs(hideBin(process.argv))
        .usage('Usage: breachhound -u <username> [options]')
        // ... (options -u, -b, --no-false-positives as before) ...
         .option('u', {
             alias: 'username',
             describe: 'The username to search for',
             type: 'string',
         })
         .option('b', {
             alias: 'breach-directory-key',
             describe: 'Your API key for BreachDirectory',
             type: 'string',
         })
         .option('no-false-positives', {
             describe: 'Hide uncertain results',
             type: 'boolean',
             default: false,
         })
         .positional('username_pos', {
             describe: 'The username to search for (positional argument)',
             type: 'string',
         })
        .help('h')
        .alias('h', 'help')
        // ... version ...
        .strict()
        .parse();

     const targetUsername = argv.u || argv.username_pos;
     if (!targetUsername || typeof targetUsername !== 'string') { // Ensure it's a string
         console.error('Error: Username is required.');
         yargs.showHelp(); // Show help message
         process.exit(1);
     }


    return {
        targetUsername: targetUsername as string, // Type assertion after check
        breachDirectoryApiKey: argv.b as string | undefined,
        hideFalsePositives: argv['no-false-positives'] as boolean,
    };
}
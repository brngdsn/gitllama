import chalk from 'chalk';
import ora from 'ora';
import { loginGithub, getGithubLoginFromToken } from './githubAuth.js';

/**
 * Handles the "gitllama config user" command by performing the GitHub OAuth Device Flow,
 * storing the token securely via keytar, and logging in the user.
 */
export async function configUser() {
  try {
    const token = await loginGithub();
    const githubLogin = await getGithubLoginFromToken(token);
    console.log(chalk.green(`Successfully logged in as ${githubLogin}.`));
  } catch (error) {
    console.error(chalk.red(`Configuration failed: ${error.message}`));
    process.exit(1);
  }
}

// Export an alias named "config" for compatibility with the CLI's import.
export { configUser as config };
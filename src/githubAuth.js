// src/githubAuth.js
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import keytar from 'keytar';
import chalk from 'chalk';
import ora from 'ora';
import { Octokit } from '@octokit/rest';

const SERVICE_NAME = 'gitllama';
const ACCOUNT_NAME = 'github-token';
// Use public_repo for public repos, and read:user to fetch user info.
const SCOPES = ['public_repo', 'read:user'];
const CLIENT_ID = 'Ov23liyoJCpS1iH6mDRT';

/**
 * Retrieves the stored GitHub token without prompting the user.
 * Throws an error if no token is found.
 */
export async function getStoredGithubToken() {
  const token = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  if (!token) {
    throw new Error('No GitHub credentials found. Please run "gitllama config user" to log in.');
  }
  return token;
}

/**
 * Performs the GitHub OAuth Device Flow using Octokit's public client.
 * The onVerification callback instructs the user to complete the device flow.
 * Upon successful authentication, stores the token securely and returns it.
 */
export async function loginGithub() {
  const spinner = ora(chalk.blue('Starting GitHub OAuth Device Flow...')).start();

  function onVerificationCallback(verification) {
    spinner.info(chalk.yellow(`Please open ${verification.verification_uri} in your browser and enter the code: ${verification.user_code}`));
  }

  const auth = createOAuthDeviceAuth({
    clientType: 'oauth-app',
    clientId: CLIENT_ID,
    scopes: SCOPES,
    onVerification: onVerificationCallback
  });

  try {
    const { token } = await auth({ type: "oauth", });
    spinner.succeed(chalk.green('GitHub authentication successful!'));
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
    return token;
  } catch (error) {
    spinner.fail(chalk.red('GitHub authentication failed.'));
    throw new Error(`GitHub authentication failed: ${error.message}`);
  }
}

/**
 * Given a valid token, retrieves the authenticated user's GitHub login.
 */
export async function getGithubLoginFromToken(token) {
  const octokit = new Octokit({ auth: token });
  try {
    const { data: user } = await octokit.users.getAuthenticated();
    return user.login;
  } catch (error) {
    throw new Error(`Failed to fetch GitHub user: ${error.message}`);
  }
}

import { promisify } from 'node:util';
import child_process from 'node:child_process';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { Octokit } from '@octokit/rest';
import { getStoredGithubToken, getGithubLoginFromToken } from './githubAuth.js';

const exec = promisify(child_process.exec);

/**
 * Initializes a new project by cloning the genesis repository,
 * setting up the remote using the authenticated GitHub user, and pushing to GitHub.
 * Relies solely on the securely stored token (via keytar) for authentication.
 */
export async function init(repoName) {
  // Retrieve the stored token; will throw an error if not found
  const token = await getStoredGithubToken();
  const githubLogin = await getGithubLoginFromToken(token);

  const genesisRepo = 'https://github.com/brngdsn/genesis';
  console.log(chalk.cyan(`Cloning genesis repository from ${genesisRepo} into ${repoName}...`));
  try {
    await exec(`git clone ${genesisRepo} ${repoName}`);
    console.log(chalk.green(`Successfully cloned repository into ${repoName}.`));
  } catch (err) {
    throw new Error(`Failed to clone genesis repository: ${err.message}`);
  }

  const repoPath = path.resolve(repoName);
  try {
    process.chdir(repoPath);
    console.log(chalk.cyan(`Changed working directory to ${repoPath}.`));
  } catch (err) {
    throw new Error(`Failed to change directory to ${repoPath}: ${err.message}`);
  }

  const remoteUrl = `git@github.com:${githubLogin}/${repoName}.git`;
  console.log(chalk.cyan(`Setting remote origin to ${remoteUrl}...`));
  try {
    await exec(`git remote remove origin`);
    await exec(`git remote add origin ${remoteUrl}`);
    console.log(chalk.green('Remote origin added successfully.'));
  } catch (err) {
    throw new Error(`Failed to add remote origin: ${err.message}`);
  }

  // Check if the remote repository exists on GitHub
  let repoExists = true;
  const spinner = ora(chalk.blue('Checking if remote repository exists...')).start();
  const octokit = new Octokit({ auth: token });
  try {
    await octokit.repos.get({
      owner: githubLogin,
      repo: repoName
    });
    spinner.succeed(chalk.green('Remote repository already exists.'));
  } catch (err) {
    if (err.status === 404) {
      repoExists = false;
      spinner.info(chalk.yellow('Remote repository does not exist. Creating repository...'));
    } else {
      spinner.fail(chalk.red('Failed to check repository existence.'));
      throw new Error(`Failed to check repository existence: ${err.message}`);
    }
  }

  if (!repoExists) {
    try {
      const response = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        private: false
      });
      console.log(chalk.green(`Remote repository created: ${response.data.html_url}`));
    } catch (err) {
      throw new Error(`Failed to create remote repository: ${err.message}`);
    }
  }

  // Push the local repository to the remote
  console.log(chalk.cyan('Pushing local repository to remote...'));
  try {
    await exec(`git push -u origin main`);
    console.log(chalk.green('Pushed local repository to remote successfully.'));
  } catch (err) {
    throw new Error(`Failed to push to remote: ${err.message}`);
  }
}
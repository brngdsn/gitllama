import { performance } from 'perf_hooks';
import chalk from 'chalk';
import ora from 'ora';
import { stageAllChanges, getStagedDiff, commitChanges, pushChanges, unstageChanges } from './gitUtils.js';
import { generateCommitMessage } from './aiUtils.js';
import { countTokens } from './tokenUtils.js';

export async function commit({ autoStage = false, push = false, simulate = false } = {}) {
  const overallStart = performance.now();
  console.log(chalk.blueBright('Starting gitllama commit process...'));

  // Stage changes if autoStage flag is set
  let stagedByGitllama = false;
  if (autoStage) {
    const stageSpinner = ora('Staging all changes...').start();
    try {
      await stageAllChanges();
      stagedByGitllama = true;
      stageSpinner.succeed('Staged all changes.');
    } catch (err) {
      stageSpinner.fail('Failed to stage changes.');
      throw err;
    }
  }

  // Get diff from staged changes
  const diffSpinner = ora('Calculating git diff...').start();
  let diff;
  try {
    diff = await getStagedDiff();
    diffSpinner.succeed('Calculated git diff.');
  } catch (err) {
    diffSpinner.fail('Failed to calculate git diff.');
    throw err;
  }

  if (!diff.trim()) {
    console.log(chalk.yellow('No staged changes detected. Exiting...'));
    return;
  }

  // Count tokens using tiktoken
  const tokenCount = countTokens(diff);
  console.log(chalk.green(`Token count for diff: ${tokenCount}`));

  // Generate commit message using AI (ollama)
  const aiSpinner = ora('Generating commit message using AI...').start();
  const aiStart = performance.now();
  let commitMessage;
  try {
    commitMessage = await generateCommitMessage(diff);
    aiSpinner.succeed('Generated commit message.');
  } catch (err) {
    aiSpinner.fail('Failed to generate commit message.');
    throw err;
  }
  const aiDuration = performance.now() - aiStart;
  console.log(chalk.green(`AI generation took ${aiDuration.toFixed(2)} ms`));

  // Display generated commit message
  console.log(chalk.blueBright('Generated Commit Message:'));
  console.log(chalk.white(commitMessage));

  // If simulation flag is set, unstage changes (if staged by gitllama) and exit without committing
  if (simulate) {
    if (stagedByGitllama) {
      const unstageSpinner = ora('Reverting staged changes (simulation)...').start();
      try {
        await unstageChanges();
        unstageSpinner.succeed('Reverted staged changes.');
      } catch (err) {
        unstageSpinner.fail('Failed to revert staged changes.');
        throw err;
      }
    }
    console.log(chalk.yellow('Simulation complete. No commit was made.'));
    const overallDuration = performance.now() - overallStart;
    console.log(chalk.blueBright(`gitllama simulation process completed in ${overallDuration.toFixed(2)} ms`));
    return;
  }

  const commitSpinner = ora('Creating git commit...').start();
  try {
    await commitChanges(commitMessage);
    commitSpinner.succeed('Git commit created.');
  } catch (err) {
    commitSpinner.fail('Failed to create git commit.');
    throw err;
  }

  // If push flag is set, push changes
  if (push) {
    const pushSpinner = ora('Pushing changes to remote...').start();
    try {
      await pushChanges();
      pushSpinner.succeed('Pushed changes to remote.');
    } catch (err) {
      pushSpinner.fail('Failed to push changes to remote.');
      throw err;
    }
  }

  const overallDuration = performance.now() - overallStart;
  console.log(chalk.blueBright(`gitllama commit process completed in ${overallDuration.toFixed(2)} ms`));
}
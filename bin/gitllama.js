#!/usr/bin/env node
import { program } from 'commander';
import { commit } from '../src/commit.js';
import { config } from '../src/config.js';
import { init } from '../src/init.js';

program
  .name('gitllama')
  .description('CLI tool for generating commit messages using AI and managing GitHub repos.')
  .version('0.3.0');

program
  .command('commit')
  .description('Generate a commit message using AI and optionally stage, commit and push changes.')
  .option('-y, --yes', 'Stage all changes before commit')
  .option('-p, --push', 'Push the commit to the remote repository (requires -y)')
  .option('-s, --simulate', 'Simulate commit: generate diff and commit message without actually committing')
  .action(async (options) => {
    try {
      await commit({
        autoStage: options.yes,
        push: options.push,
        simulate: options.simulate
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure GitHub credentials via OAuth device flow')
  .action(async () => {
    await config();
  });

program
  .command('init <repoName>')
  .description('Initialize a new project from the genesis repository')
  .action(async (repoName) => {
    await init(repoName);
  });

program.parse();
#!/usr/bin/env node
import { Command } from 'commander';
import { commit } from '../src/commit.js';

const program = new Command();

program
  .name('gitllama')
  .description('A CLI tool that uses AI to generate git commit messages based on your changes.')
  .version('0.2.0');

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

program.parse(process.argv);
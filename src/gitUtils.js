import { promisify } from 'node:util';
import child_process from 'node:child_process';
const exec = promisify(child_process.exec);

export async function stageAllChanges() {
  await exec('git add .');
}

export async function getStagedDiff() {
  // Use 'git diff --cached' to get diff of staged changes
  const { stdout } = await exec('git diff --cached');
  return stdout;
}

export async function commitChanges(message) {
  // Create a git commit with the generated message.
  // Escape double quotes to avoid shell injection issues.
  const safeMessage = message.replace(/"/g, '\\"');
  await exec(`git commit -m "${safeMessage}"`);
}

export async function pushChanges() {
  // Determine current branch name
  const { stdout: branchStdout } = await exec('git rev-parse --abbrev-ref HEAD');
  const branch = branchStdout.trim();
  // Assume remote is 'origin'
  await exec(`git push origin ${branch}`);
}

export async function unstageChanges() {
  // Unstage changes by resetting the index to HEAD
  await exec('git reset');
}
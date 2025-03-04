import ollama from 'ollama';

export async function generateCommitMessage(diff, model = 'llama3.2:latest', role = 'user') {
  const prompt = [
    `Generate a concise and descriptive git commit message based on the provided diff.`,
    `Only respond with the commit message.\n\n`,
    `\`\`\`\n${diff}\n\`\`\``,
  ].join(` `);
  const content = prompt;
  const message = { role, content, };
  const messages = [message,];
  const stream = true;
  const chat = await ollama.chat({ model, messages, stream,});
  const parts = [];
  for await (const part of chat) {
    process.stdout.write(part.message.content.replace(`\n`,``))
    parts.push(part);
  }
  return parts.map(p => p.message.content).join(``).trim();
}
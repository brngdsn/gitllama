import ollama from 'ollama';

export async function generateCommitMessage(diff, model = 'llama3.2:latest', role = 'user') {
  const prompt = [
    `You're an expert git commit message writer.`,
    `Generate a concise and descriptive git commit message based on the provided diff.`,
    `The message should be short and succinct.`,
    `DO NOT CRITIQUE. DO NOT SUGGEST. DO NOT PROVIDE ANY SNIPPETS.`,
    `Your response should look like:\n\n`,
    `A great commit message is clear, concise, and informative. One proven structure that many teams swear by is:

\`\`\`
<type>(<scope>): <short, imperative summary>

<BLANK LINE>

<detailed explanation of the change, rationale, and context>
- Explain why the change was necessary
- Outline what was done and any side effects
- Wrap text at around 72 characters per line

<BLANK LINE>

[Footer: references, e.g. "Closes #123", "BREAKING CHANGE: description"]
\`\`\`

### Key Points

- **Header Line:**  
  - **Type & Scope:** Use a conventional type (like \`feat\`, \`fix\`, \`docs\`, etc.) and an optional scope (e.g., module or component name).  
  - **Short Summary:** A brief, imperative sentence (e.g., “fix bug in login flow”) ideally under 50 characters.
  
- **Body:**  
  - Provide context about why the change was made.  
  - Detail how the change addresses the issue and mention any side effects.
  - Keep each line wrapped at around 72 characters for readability.

- **Footer:**  
  - Reference related issues, tickets, or breaking changes.  
  - Format references clearly (e.g., “Closes #456” or “BREAKING CHANGE: updated API contract”).

This structure not only aids in readability when scanning commit logs but also helps future developers understand the rationale behind changes quickly.`,
    `ONLY respond with the git commit message in the proven structure. DO NOT USE CODE FENCE. DO NOT COMMENT. DO NOT REFLECT.\n\n`,
    `\`\`\`\n${diff}\n\`\`\``,
  ].join(` `);
  const content = prompt;
  const message = { role, content, };
  const messages = [message,];
  const stream = true;
  const chat = await ollama.chat({ model, messages, stream,});
  const parts = [];
  for await (const part of chat) {
    process.stdout.write(part.message.content.split(`\n`).join(``))
    parts.push(part);
  }
  return parts.map(p => p.message.content).join(``).trim();
}
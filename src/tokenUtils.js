import { encodingForModel } from 'js-tiktoken';

export function countTokens(text) {
  // Initialize the encoder for the model "llama3.2"
  const encoder = encodingForModel('gpt-4o');
  const tokens = encoder.encode(text);
  return tokens.length;
}
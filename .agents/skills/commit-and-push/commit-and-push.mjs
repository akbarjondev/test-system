#!/usr/bin/env node

import { execSync } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getGitDiff() {
  try {
    return execSync('git diff --cached', { encoding: 'utf-8' });
  } catch {
    return execSync('git diff', { encoding: 'utf-8' });
  }
}

async function generateCommitMessage(diff) {
  if (!diff.trim()) {
    throw new Error('No changes found to commit');
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Generate a concise commit message (max 50 chars) for these git changes:\n\n${diff.slice(0, 2000)}`,
      },
    ],
  });

  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';
  return text.trim();
}

async function main() {
  try {
    console.log('📝 Fetching git changes...');
    const diff = await getGitDiff();

    console.log('🤖 Generating commit message with Haiku...');
    const commitMessage = await generateCommitMessage(diff);

    console.log(`\n✅ Generated message: "${commitMessage}"\n`);

    console.log('📦 Staging all changes...');
    execSync('git add -A', { stdio: 'inherit' });

    console.log('💾 Creating commit...');
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit',
    });

    console.log('🚀 Pushing to remote...');
    execSync('git push', { stdio: 'inherit' });

    console.log('\n✨ Done! Changes committed and pushed.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

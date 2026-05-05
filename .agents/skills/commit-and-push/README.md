# Custom Agents

## commit-and-push

Automatically stages changes, generates a commit message using Claude Haiku, and pushes to remote.

### Usage

**From Bash/PowerShell:**
```bash
node .agents/commit-and-push.mjs
```

Or with the shell wrapper:
```bash
bash .agents/commit-and-push.sh
```

### How it works

1. Gets unstaged or staged git changes
2. Sends diff to Claude Haiku (via Anthropic API) to generate a concise commit message
3. Stages all changes (`git add -A`)
4. Creates commit with the generated message
5. Pushes to remote

### Requirements

- `ANTHROPIC_API_KEY` environment variable set
- `@anthropic-ai/sdk` installed (should already be in project)
- Git repository with remote configured

### Example

```
📝 Fetching git changes...
🤖 Generating commit message with Haiku...

✅ Generated message: "feat: add commit-and-push agent"

📦 Staging all changes...
💾 Creating commit...
🚀 Pushing to remote...

✨ Done! Changes committed and pushed.
```

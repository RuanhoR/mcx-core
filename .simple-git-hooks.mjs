export default {
  "commit-msg": "node scripts/verify-commit.js",
  "precommit": "pnpm format && pnpm lint"
}

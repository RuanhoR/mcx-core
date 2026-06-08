export default {
  "commit-msg": "node scripts/verify-commit.js",
  "pre-commit": "pnpm format && pnpm lint"
}

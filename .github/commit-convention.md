# Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

## Format

```
<type>(<scope>): <subject>
```

## Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only changes                              |
| `dx`       | Developer experience improvements                       |
| `style`    | Changes that do not affect the meaning of the code      |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf`     | A code change that improves performance                 |
| `test`     | Adding missing tests or correcting existing tests       |
| `workflow` | Changes to development workflows                        |
| `build`    | Changes that affect the build system or dependencies    |
| `ci`       | Changes to CI configuration files and scripts           |
| `chore`    | Other changes that don't modify src or test files       |
| `types`    | Type definition changes                                 |
| `wip`      | Work in progress                                        |
| `release`  | Release commits                                         |

## Examples

```
feat(compiler): add 'comments' option
fix(v-model): handle events on blur (close #28)
docs: update README with new API
refactor(core): simplify transform pipeline
```

## Rules

- The subject must not exceed 50 characters.
- Use the imperative mood in the subject line.
- Do not capitalize the first letter of the subject.
- Do not end the subject with a period.

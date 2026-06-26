# create-mbler

CLI scaffolding tool for creating new MCX / mbler projects. Quickly generate a project with the correct directory structure, configuration files, and dependencies.

## Usage

```bash
# Using pnpm
pnpm create mbler my-addon

# Using npx
npx create-mbler my-addon

# Using the CLI directly
create-mbler my-addon
```

The CLI will prompt you for:

- **Project name / description**
- **Minecraft version target**
- **Modules to include**
- **Language** — MCX DSL (`.mcx`), TypeScript (`.ts`), or JavaScript (`.js`)
- **Package manager** — pnpm or npm

## Generated Structure

```
my-addon/
├── behavior/
│   └── scripts/
│       └── main.js
├── resources/
├── package.json
├── mbler.config.js
├── tsconfig.json
└── .gitignore
```

## GitHub

[Repository](https://github.com/RuanhoR/mcx-core/tree/main/packages/create-mbler) | [Mbler](https://github.com/RuanhoR/mbler)

## License

MIT

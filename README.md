# sizela

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm run dev
```

## Git Hooks and Formatting

- Initialize hooks: `pnpm run prepare`
- Run checks: `pnpm run check`

## Project Structure

```
sizela/
├── apps/
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run build:core`: Build the publishable `@sizela/core` package
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run check`: Run Biome formatting and linting
- `pnpm run jsr:publish`: Publish all discovered JSR packages after syncing manifest versions
- `pnpm run release:sync-jsr`: Sync workspace package versions into matching `jsr.json` files

## Publishing

The repository root is a private monorepo package and cannot be published directly.

For automated releases, GitHub Actions uses Changesets for npm publishing and trusted publishing for JSR.

To publish JSR packages manually after syncing versions, run:

```bash
pnpm run jsr:publish
```

For GitHub Actions publishing, JSR should be configured for trusted publishing from this repository.
The workflow uses GitHub OIDC and does not require a `JSR_TOKEN`.

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
- `pnpm run publish:core`: Publish `@sizela/core` from the workspace root
- `pnpm run publish:jsr`: Publish `@sizela/core` to JSR using `jsr.json`

## Publishing

The repository root is a private monorepo package and cannot be published.

To publish the library package instead, run:

```bash
pnpm run build:core
pnpm run publish:core
```

To publish the same API to JSR, run:

```bash
pnpm run publish:jsr
```

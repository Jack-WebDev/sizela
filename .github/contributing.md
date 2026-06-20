# Contributing to Sizela

Thank you for your interest in contributing to Sizela.

This guide covers contributions to the Sizela source code in this repository. For product or usage documentation, refer to the [documentation site](https://sizela-docs.vercel.app/).

## Questions and Discussions

If you have a question about how Sizela works, want to discuss an idea, or need clarification on the roadmap, use [GitHub Discussions](https://github.com/Jack-WebDev/sizela/discussions).

Before opening a new discussion, search existing threads to avoid duplicates.

## Bug Reports and Feature Requests

If you have found a bug or want to propose an improvement, open an issue on the [GitHub Issues](https://github.com/Jack-WebDev/sizela/issues) page.

Before creating a new issue:

- Search existing issues to see whether the problem or request has already been reported.
- Include enough context for someone else to understand the problem and reproduce it.
- Keep the scope focused to a single bug or feature request where possible.

## Contributing Code

If you want to contribute code, start by reviewing the [open issues](https://github.com/Jack-WebDev/sizela/issues) to find work that aligns with your interests. Issues are generally not assigned in advance, so if you decide to work on something, you can open a pull request when your change is ready.

If you are unsure about an approach, ask questions on the issue before investing heavily in implementation.

## Local Development

To get started locally:

1. Install dependencies from the repository root:

   ```bash
   pnpm install
   ```

2. Use the project Node version if needed:

   ```bash
   nvm use
   ```

3. Run the relevant checks before opening a pull request:

   ```bash
   pnpm run lint
   pnpm run check-types
   pnpm run build
   ```

4. Run the project test suite before submitting a change. Use the appropriate workspace or root-level test command for the part of the codebase you modified.

5. If you need to work across apps or packages during development:

   ```bash
   pnpm run dev
   ```

## Implementation Guidelines

When contributing code, aim to keep the library simple, readable, and easy to reason about.

- Prefer straightforward implementations over clever abstractions.
- Add or update tests when behavior changes.
- Avoid introducing internal APIs unless there is a clear and durable need for them.
- Avoid unnecessary coupling between Sizela modules. In most cases, functions should remain understandable in isolation.
- Keep utilities focused. If a feature requires substantial complexity, it may belong in a different package or a different layer of the project.

## Pull Requests

When your change is ready, open a pull request against the `main` branch of the [sizela repository](https://github.com/Jack-WebDev/sizela).

Please make sure your pull request:

- Clearly explains what changed and why.
- Includes tests for new behavior or bug fixes when applicable.
- Links to the relevant issue when applicable.
- Enables [maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork).

Once submitted, the pull request will be reviewed by the maintainer. Follow-up questions or revision requests may be part of that process.

## Releases

Publishing is currently handled manually. After a pull request is merged, the release may follow shortly afterward rather than immediately.

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		exclude: ["**/dist/**", "**/node_modules/**", "**/.turbo/**"],
		projects: [
			{
				test: {
					name: "core",
					root: "./packages/core",
					include: ["src/**/*.test.ts"],
				},
			},
		],
	},
});

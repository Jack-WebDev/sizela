import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
	matchJsrManifestsToPackages,
	syncJsrVersions,
} from "./sync-jsr-versions.mjs";

async function writeJson(filePath, value) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(value, null, "\t")}\n`);
}

async function createRepo(structure) {
	const rootDir = await mkdtemp(path.join(os.tmpdir(), "sizela-jsr-sync-"));
	await writeFile(
		path.join(rootDir, "pnpm-workspace.yaml"),
		structure.workspace,
	);

	for (const [relativePath, value] of Object.entries(structure.files)) {
		if (relativePath.endsWith(".json")) {
			await writeJson(path.join(rootDir, relativePath), value);
			continue;
		}

		await mkdir(path.dirname(path.join(rootDir, relativePath)), {
			recursive: true,
		});
		await writeFile(path.join(rootDir, relativePath), value);
	}

	return rootDir;
}

test("syncJsrVersions updates a single matching manifest", async () => {
	const rootDir = await createRepo({
		workspace: 'packages:\n  - "packages/*"\n',
		files: {
			"packages/core/package.json": {
				name: "@sizela/core",
				version: "1.2.3",
			},
			"jsr.json": {
				name: "@sizela/core",
				version: "0.0.1",
				exports: "./mod.ts",
			},
		},
	});

	const updated = await syncJsrVersions(rootDir);
	const manifest = JSON.parse(
		await readFile(path.join(rootDir, "jsr.json"), "utf8"),
	);

	assert.deepEqual(updated, [
		{
			name: "@sizela/core",
			path: "jsr.json",
			version: "1.2.3",
		},
	]);
	assert.equal(manifest.version, "1.2.3");
});

test("syncJsrVersions updates multiple manifests without hard-coded package names", async () => {
	const rootDir = await createRepo({
		workspace: 'packages:\n  - "packages/*"\n',
		files: {
			"packages/core/package.json": {
				name: "@sizela/core",
				version: "1.0.0",
			},
			"packages/utils/package.json": {
				name: "@sizela/utils",
				version: "2.0.0",
			},
			"packages/core/jsr.json": {
				name: "@sizela/core",
				version: "0.1.0",
			},
			"packages/utils/jsr.json": {
				name: "@sizela/utils",
				version: "0.1.0",
			},
		},
	});

	const updated = await syncJsrVersions(rootDir);

	assert.equal(updated.length, 2);
	assert.equal(
		JSON.parse(
			await readFile(path.join(rootDir, "packages/core/jsr.json"), "utf8"),
		).version,
		"1.0.0",
	);
	assert.equal(
		JSON.parse(
			await readFile(path.join(rootDir, "packages/utils/jsr.json"), "utf8"),
		).version,
		"2.0.0",
	);
});

test("matchJsrManifestsToPackages fails when a manifest name has no workspace package", async () => {
	const rootDir = await createRepo({
		workspace: 'packages:\n  - "packages/*"\n',
		files: {
			"packages/core/package.json": {
				name: "@sizela/core",
				version: "1.0.0",
			},
			"jsr.json": {
				name: "@sizela/missing",
				version: "1.0.0",
			},
		},
	});

	await assert.rejects(
		() => matchJsrManifestsToPackages(rootDir),
		/No workspace package matches JSR manifest/,
	);
});

test("matchJsrManifestsToPackages fails when multiple packages share the manifest name", async () => {
	const rootDir = await createRepo({
		workspace: 'packages:\n  - "packages/*"\n  - "modules/*"\n',
		files: {
			"packages/core/package.json": {
				name: "@sizela/core",
				version: "1.0.0",
			},
			"modules/core/package.json": {
				name: "@sizela/core",
				version: "2.0.0",
			},
			"jsr.json": {
				name: "@sizela/core",
				version: "0.1.0",
			},
		},
	});

	await assert.rejects(
		() => matchJsrManifestsToPackages(rootDir),
		/matches multiple workspace packages named/,
	);
});

import { spawn } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const IGNORED_DIRS = new Set([".git", ".turbo", "node_modules"]);

function isObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function readJson(filePath) {
	return JSON.parse(await readFile(filePath, "utf8"));
}

async function pathExists(filePath) {
	try {
		await stat(filePath);
		return true;
	} catch {
		return false;
	}
}

function parseWorkspacePatterns(workspaceContents) {
	const lines = workspaceContents.split(/\r?\n/);
	const patterns = [];
	let inPackages = false;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		if (!inPackages) {
			inPackages = trimmed === "packages:";
			continue;
		}

		if (!trimmed.startsWith("-")) {
			break;
		}

		const value = trimmed
			.slice(1)
			.trim()
			.replace(/^['"]|['"]$/g, "");
		if (value) {
			patterns.push(value);
		}
	}

	return patterns;
}

async function expandWorkspacePattern(rootDir, pattern) {
	const segments = pattern.split("/").filter(Boolean);

	async function walk(currentDir, index) {
		if (index >= segments.length) {
			return [currentDir];
		}

		const segment = segments[index];
		if (segment.includes("**")) {
			throw new Error(
				`Unsupported workspace glob "${pattern}". Use single-level "*" segments only.`,
			);
		}

		if (segment === "*") {
			const entries = await readdir(currentDir, { withFileTypes: true });
			const matches = await Promise.all(
				entries
					.filter((entry) => entry.isDirectory())
					.map((entry) => walk(path.join(currentDir, entry.name), index + 1)),
			);
			return matches.flat();
		}

		if (segment.includes("*")) {
			throw new Error(
				`Unsupported workspace glob "${pattern}". Mixed literal and "*" segments are not supported.`,
			);
		}

		const nextDir = path.join(currentDir, segment);
		if (!(await pathExists(nextDir))) {
			return [];
		}
		return walk(nextDir, index + 1);
	}

	return walk(rootDir, 0);
}

export async function discoverWorkspacePackages(rootDir = repoRoot) {
	const workspaceFile = path.join(rootDir, "pnpm-workspace.yaml");
	const patterns = parseWorkspacePatterns(
		await readFile(workspaceFile, "utf8"),
	);
	const packageDirs = new Set();

	for (const pattern of patterns) {
		const matches = await expandWorkspacePattern(rootDir, pattern);
		for (const match of matches) {
			const packageJsonPath = path.join(match, "package.json");
			if (await pathExists(packageJsonPath)) {
				packageDirs.add(match);
			}
		}
	}

	const packages = [];
	for (const packageDir of [...packageDirs].sort()) {
		const manifest = await readJson(path.join(packageDir, "package.json"));
		packages.push({
			dir: packageDir,
			manifestPath: path.join(packageDir, "package.json"),
			manifest,
			name: manifest.name,
			version: manifest.version,
			private: manifest.private === true,
		});
	}

	return packages;
}

async function walkForFiles(rootDir, fileName) {
	const results = [];

	async function walk(currentDir) {
		const entries = await readdir(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const entryPath = path.join(currentDir, entry.name);

			if (entry.isDirectory()) {
				if (!IGNORED_DIRS.has(entry.name)) {
					await walk(entryPath);
				}
				continue;
			}

			if (entry.isFile() && entry.name === fileName) {
				results.push(entryPath);
			}
		}
	}

	await walk(rootDir);
	return results.sort();
}

export async function discoverJsrManifests(rootDir = repoRoot) {
	const manifestPaths = await walkForFiles(rootDir, "jsr.json");
	const manifests = [];

	for (const manifestPath of manifestPaths) {
		const manifest = await readJson(manifestPath);
		if (
			!isObject(manifest) ||
			typeof manifest.name !== "string" ||
			!manifest.name.trim()
		) {
			throw new Error(
				`JSR manifest ${path.relative(rootDir, manifestPath)} must include a non-empty "name" field.`,
			);
		}

		manifests.push({
			dir: path.dirname(manifestPath),
			manifestPath,
			manifest,
			name: manifest.name,
			version: manifest.version,
		});
	}

	return manifests;
}

export async function matchJsrManifestsToPackages(rootDir = repoRoot) {
	const workspacePackages = await discoverWorkspacePackages(rootDir);
	const jsrManifests = await discoverJsrManifests(rootDir);
	const packagesByName = new Map();

	for (const pkg of workspacePackages) {
		if (!pkg.name) {
			continue;
		}

		const matches = packagesByName.get(pkg.name) ?? [];
		matches.push(pkg);
		packagesByName.set(pkg.name, matches);
	}

	return jsrManifests.map((jsrManifest) => {
		const packageMatches = packagesByName.get(jsrManifest.name) ?? [];

		if (packageMatches.length === 0) {
			throw new Error(
				`No workspace package matches JSR manifest ${path.relative(rootDir, jsrManifest.manifestPath)} with name "${jsrManifest.name}".`,
			);
		}

		if (packageMatches.length > 1) {
			const matchList = packageMatches
				.map((pkg) => path.relative(rootDir, pkg.manifestPath))
				.join(", ");
			throw new Error(
				`JSR manifest ${path.relative(rootDir, jsrManifest.manifestPath)} matches multiple workspace packages named "${jsrManifest.name}": ${matchList}.`,
			);
		}

		return {
			jsrManifest,
			workspacePackage: packageMatches[0],
		};
	});
}

export async function syncJsrVersions(rootDir = repoRoot) {
	const matches = await matchJsrManifestsToPackages(rootDir);
	const updated = [];

	for (const { jsrManifest, workspacePackage } of matches) {
		if (jsrManifest.manifest.version === workspacePackage.version) {
			continue;
		}

		const nextManifest = {
			...jsrManifest.manifest,
			version: workspacePackage.version,
		};
		await writeFile(
			jsrManifest.manifestPath,
			`${JSON.stringify(nextManifest, null, "\t")}\n`,
		);
		updated.push({
			name: jsrManifest.name,
			path: path.relative(rootDir, jsrManifest.manifestPath),
			version: workspacePackage.version,
		});
	}

	return updated;
}

function printManifests(manifests, rootDir = repoRoot, format = "json") {
	const values = manifests.map(({ jsrManifest }) =>
		path.relative(rootDir, jsrManifest.manifestPath),
	);
	if (format === "lines") {
		process.stdout.write(
			`${values.join("\n")}${values.length > 0 ? "\n" : ""}`,
		);
		return;
	}

	process.stdout.write(`${JSON.stringify(values)}\n`);
}

async function publishJsrPackages(rootDir = repoRoot) {
	await syncJsrVersions(rootDir);
	const matches = await matchJsrManifestsToPackages(rootDir);

	for (const { jsrManifest } of matches) {
		await new Promise((resolve, reject) => {
			const child = spawn("pnpm", ["dlx", "jsr", "publish"], {
				cwd: jsrManifest.dir,
				stdio: "inherit",
				env: process.env,
			});

			child.on("exit", (code) => {
				if (code === 0) {
					resolve();
					return;
				}
				reject(
					new Error(
						`JSR publish failed for ${path.relative(rootDir, jsrManifest.manifestPath)} with exit code ${code}.`,
					),
				);
			});
			child.on("error", reject);
		});
	}
}

async function main() {
	const [command = "sync", ...args] = process.argv.slice(2);
	const format = args.includes("--format=lines") ? "lines" : "json";

	if (command === "list") {
		printManifests(
			await matchJsrManifestsToPackages(repoRoot),
			repoRoot,
			format,
		);
		return;
	}

	if (command === "sync") {
		const updated = await syncJsrVersions(repoRoot);
		if (updated.length === 0) {
			process.stdout.write("JSR manifests already in sync.\n");
			return;
		}

		for (const entry of updated) {
			process.stdout.write(
				`Synced ${entry.path} to ${entry.version} (${entry.name}).\n`,
			);
		}
		return;
	}

	if (command === "check") {
		await matchJsrManifestsToPackages(repoRoot);
		process.stdout.write("JSR manifest mapping is valid.\n");
		return;
	}

	if (command === "publish") {
		await publishJsrPackages(repoRoot);
		return;
	}

	throw new Error(
		`Unknown command "${command}". Expected one of: sync, list, check, publish.`,
	);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}

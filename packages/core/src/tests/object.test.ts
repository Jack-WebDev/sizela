import { describe, expect, expectTypeOf, it } from "vitest";

import { entriesOf, hasOwn, keysOf, omit, pick } from "../index";

describe("hasOwn", () => {
	it("returns true for own properties", () => {
		const value = { name: "sizela" };

		expect(hasOwn(value, "name")).toBe(true);
		expect(hasOwn(value, "missing")).toBe(false);
	});

	it("narrows the key type", () => {
		const value = { name: "sizela", version: 1 };
		const key: string = "name";

		if (hasOwn(value, key)) {
			expectTypeOf<typeof key>().toEqualTypeOf<"name" | "version">();
			expectTypeOf<(typeof value)[typeof key]>().toEqualTypeOf<
				string | number
			>();
		}
	});
});

describe("keysOf", () => {
	it("returns enumerable string keys", () => {
		const value = { name: "sizela", version: 1 };

		expect(keysOf(value)).toEqual(["name", "version"]);
	});

	it("preserves key unions", () => {
		const value = { name: "sizela", version: 1 };

		expectTypeOf(keysOf(value)).toEqualTypeOf<Array<"name" | "version">>();
	});
});

describe("entriesOf", () => {
	it("returns enumerable entries", () => {
		const value = { name: "sizela", version: 1 };

		expect(entriesOf(value)).toEqual([
			["name", "sizela"],
			["version", 1],
		]);
	});

	it("preserves key and value pairs", () => {
		const value = { name: "sizela", version: 1 };

		expectTypeOf(entriesOf(value)).toEqualTypeOf<
			Array<["name", string] | ["version", number]>
		>();
	});
});

describe("pick", () => {
	it("creates a new object with only the requested keys", () => {
		const value = { name: "sizela", version: 1, stable: true };

		expect(pick(value, ["name", "stable"] as const)).toEqual({
			name: "sizela",
			stable: true,
		});
		expect(value).toEqual({ name: "sizela", version: 1, stable: true });
	});

	it("preserves the selected property types", () => {
		const value = { name: "sizela", version: 1, stable: true };

		expectTypeOf(pick(value, ["name", "stable"] as const)).toEqualTypeOf<{
			name: string;
			stable: boolean;
		}>();
	});
});

describe("omit", () => {
	it("creates a new object without the excluded keys", () => {
		const value = { name: "sizela", version: 1, stable: true };

		expect(omit(value, ["version"] as const)).toEqual({
			name: "sizela",
			stable: true,
		});
		expect(value).toEqual({ name: "sizela", version: 1, stable: true });
	});

	it("preserves the remaining property types", () => {
		const value = { name: "sizela", version: 1, stable: true };

		expectTypeOf(omit(value, ["version"] as const)).toEqualTypeOf<{
			name: string;
			stable: boolean;
		}>();
	});
});

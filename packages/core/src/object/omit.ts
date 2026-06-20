import { ownEnumerableKeys } from "./shared";

/**
 * Creates a new object without the excluded keys.
 */
export function omit<
	ObjectType extends object,
	const Keys extends readonly (keyof ObjectType)[],
>(object: ObjectType, keys: Keys): Omit<ObjectType, Keys[number]> {
	const excludedKeys = new Set<keyof ObjectType>(keys);
	const result = {} as Omit<ObjectType, Keys[number]>;

	for (const key of ownEnumerableKeys(object)) {
		if (!excludedKeys.has(key)) {
			(result as ObjectType)[key] = object[key];
		}
	}

	return result;
}

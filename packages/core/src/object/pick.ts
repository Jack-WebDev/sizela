import { hasOwn } from "./has-own";

/**
 * Creates a new object containing only the requested keys.
 */
export function pick<
	ObjectType extends object,
	const Keys extends readonly (keyof ObjectType)[],
>(object: ObjectType, keys: Keys): Pick<ObjectType, Keys[number]> {
	const result = {} as Pick<ObjectType, Keys[number]>;

	for (const key of keys) {
		if (hasOwn(object, key)) {
			(result as ObjectType)[key] = object[key];
		}
	}

	return result;
}

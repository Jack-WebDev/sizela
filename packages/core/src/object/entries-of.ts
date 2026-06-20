import type { ObjectEntry } from "./shared";

/**
 * Returns the enumerable string entries of `object` with preserved key/value pairs.
 */
export function entriesOf<ObjectType extends object>(
	object: ObjectType,
): Array<ObjectEntry<ObjectType>> {
	return Object.entries(object) as Array<ObjectEntry<ObjectType>>;
}

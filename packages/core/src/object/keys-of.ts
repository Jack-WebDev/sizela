import type { StringKeyOf } from "./shared";

/**
 * Returns the enumerable string keys of `object` with preserved key unions.
 */
export function keysOf<ObjectType extends object>(
	object: ObjectType,
): Array<StringKeyOf<ObjectType>> {
	return Object.keys(object) as Array<StringKeyOf<ObjectType>>;
}

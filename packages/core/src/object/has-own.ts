/**
 * Returns `true` when `key` is an own property of `object`.
 */
const objectHasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwn<ObjectType extends object, Key extends PropertyKey>(
	object: ObjectType,
	key: Key,
): key is Key & keyof ObjectType {
	return objectHasOwnProperty.call(object, key);
}

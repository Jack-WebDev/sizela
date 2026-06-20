export type ObjectKey = string | number | symbol;

export type StringKeyOf<T extends object> = Extract<keyof T, string>;
export type RuntimeObjectKeyOf<T extends object> = Extract<
	keyof T,
	string | symbol
>;

export type ObjectEntry<T extends object> = {
	[K in StringKeyOf<T>]: [K, T[K]];
}[StringKeyOf<T>];

const isPropertyEnumerable = Object.prototype.propertyIsEnumerable;

export function ownEnumerableKeys<ObjectType extends object>(
	object: ObjectType,
): Array<RuntimeObjectKeyOf<ObjectType>> {
	return Reflect.ownKeys(object).filter((key) =>
		isPropertyEnumerable.call(object, key),
	) as Array<RuntimeObjectKeyOf<ObjectType>>;
}

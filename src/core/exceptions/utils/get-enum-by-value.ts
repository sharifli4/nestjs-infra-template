/**
 * Utility function to get enum key by its value
 */
export function GetEnumByValue<T extends Record<string, string | number>>(
  value: string | number,
  enumObj: T,
): string | undefined {
  const keys = Object.keys(enumObj) as Array<keyof T>;
  const key = keys.find((k) => enumObj[k] === value);
  return key as string | undefined;
}

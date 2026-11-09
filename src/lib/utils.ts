// ponytail: clsx-compatible, no tailwind-merge. Every cn() call site passes
// disjoint class names, so conflict resolution is never exercised. If a caller
// starts overriding Tailwind utilities via className, bring tailwind-merge back.
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: unknown };

function toClass(value: ClassValue): string {
  if (!value || value === true) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(toClass).filter(Boolean).join(' ');
  return Object.keys(value)
    .filter((key) => value[key])
    .join(' ');
}

export function cn(...inputs: ClassValue[]): string {
  return toClass(inputs);
}

// Declaration for uuid@8.x which does not bundle its own type definitions
declare module 'uuid' {
  export function v4(options?: { random?: number[]; rng?: () => number[] }): string;
  export function v1(): string;
  export function v3(name: string, namespace: string | Uint8Array): string;
  export function v5(name: string, namespace: string | Uint8Array): string;
  export function validate(uuid: string): boolean;
  export function version(uuid: string): number;
}

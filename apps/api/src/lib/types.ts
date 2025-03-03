import type { Readable } from "node:stream";

/**
 * Type-safe version of the Node.js Readable stream.
 * Helps ensure type safety for streams.
 */
export interface TypedReadable<T> extends Readable {
  on(event: "data", listener: (chunk: T) => void): this;
  on(event: "end" | "close" | "error" | string, listener: (...args: unknown[]) => void): this;
  read(): T;
} 
import type { TransformCallback } from "node:stream";

import { Transform } from "node:stream";

export class BatchTransform<T> extends Transform {
  private batch: T[] = [];

  constructor(private batchSize: number) {
    super({ objectMode: true });
  }

  _transform(chunk: T, _encoding: string, callback: TransformCallback) {
    // Collect the chunk
    this.batch.push(chunk);
    // When batch size is reached, push the batch and reset
    if (this.batch.length >= this.batchSize) {
      this.push(this.batch);
      this.batch = [];
    }
    callback();
  }

  _flush(callback: TransformCallback) {
    // Push any remaining items as a final batch
    if (this.batch.length > 0) {
      this.push(this.batch);
    }
    callback();
  }
}

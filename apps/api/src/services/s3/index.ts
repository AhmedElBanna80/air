import type { Container } from "di-wise";

import { Scope } from "di-wise";

import { S3Service } from "./s3.service";
import { S3ServiceToken } from "./s3.types";

export * from "./s3.service";
export * from "./s3.types";

export function registerS3Service(container: Container) {
  container.register(S3ServiceToken, {
    useClass: S3Service,
  }, { scope: Scope.Container });
}

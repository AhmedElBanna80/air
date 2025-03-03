import type { Container } from "di-wise";
import type { Buffer } from "node:buffer";

import { Scope, Type } from "di-wise";

import { S3Service } from "./s3.service";

export type S3UploadResult = {
  key: string;
  location: string;
  etag: string;
  bucket: string;
};

export type S3FileInfo = {
  key: string;
  size: number | undefined;
  lastModified: Date | undefined;
};

export type S3ServiceType = {
  ensureBucketExists: (bucketName?: string) => Promise<void>;
  uploadFile: (
    file: Buffer,
    key: string,
    contentType: string,
    bucketName?: string
  ) => Promise<S3UploadResult>;
  listFiles: (prefix?: string, bucketName?: string) => Promise<S3FileInfo[]>;
};

export const S3ServiceToken = Type<S3ServiceType>("S3Service");

export function registerS3Service(container: Container) {
  container.register(S3ServiceToken, {
    useClass: S3Service,
  }, { scope: Scope.Container });
}

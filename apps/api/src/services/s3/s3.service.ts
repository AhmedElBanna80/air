import type { Buffer } from "node:buffer";

import {
  CreateBucketCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { inject, Injectable } from "di-wise";

import env from "../../env";
import { LoggerToken } from "../logger/logger.types";
import { type S3FileInfo, S3ServiceToken, type S3ServiceType, type S3UploadResult } from "./s3.types";

@Injectable<S3Service>(S3ServiceToken)
export class S3Service implements S3ServiceType {
  private readonly logger = inject(LoggerToken);
  private readonly s3Client: S3Client;
  private readonly defaultBucket: string;

  constructor() {
    // Configure S3 client
    this.s3Client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
    });

    this.defaultBucket = env.S3_BUCKET;
  }

  async ensureBucketExists(bucketName: string = this.defaultBucket): Promise<void> {
    try {
      this.logger.debug(`Checking if bucket ${bucketName} exists`);
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.logger.debug(`Bucket ${bucketName} exists`);
    }
    catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.info(`Bucket ${bucketName} does not exist, creating it`, errorMessage);
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      this.logger.info(`Bucket ${bucketName} created successfully`);
    }
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    bucketName: string = this.defaultBucket,
  ): Promise<S3UploadResult> {
    try {
      // Ensure bucket exists
      await this.ensureBucketExists(bucketName);

      this.logger.debug(`Uploading file to ${bucketName}/${key}`);

      // Create multipart upload
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: file,
          ContentType: contentType,
        },
      });

      // Start upload and wait for completion
      const result = await upload.done();

      this.logger.info(`File uploaded successfully to ${bucketName}/${key}`);

      return {
        key,
        location: `s3://${bucketName}/${key}`,
        etag: result.ETag || "",
        bucket: bucketName,
      };
    }
    catch (error) {
      this.logger.error(`Error uploading file to ${bucketName}/${key}:`, error);
      throw error;
    }
  }

  async listFiles(
    prefix = "",
    bucketName = this.defaultBucket,
  ): Promise<S3FileInfo[]> {
    try {
      // Ensure bucket exists
      await this.ensureBucketExists(bucketName);

      this.logger.debug(`Listing files in ${bucketName}/${prefix}`);

      const result = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          MaxKeys: 100,
        }),
      );

      const files = result.Contents?.map(item => ({
        key: item.Key || "",
        size: item.Size,
        lastModified: item.LastModified,
      })) || [];

      this.logger.debug(`Found ${files.length} files in ${bucketName}/${prefix}`);
      return files;
    }
    catch (error) {
      this.logger.error(`Error listing files in ${bucketName}/${prefix}:`, error);
      throw error;
    }
  }
}

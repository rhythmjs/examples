import { S3Client } from "bun";

export function createStorage(): S3Client {
  return new S3Client({
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "minioadmin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "minioadmin",
    bucket: process.env.S3_BUCKET ?? "uploads",
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9100",
  });
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent } from "https";

const requestHandler = process.env.S3_FORCE_IPV4 === "true"
  ? new NodeHttpHandler({
      httpsAgent: new Agent({ family: 4 }) // 强制使用 IPv4
    })
  : undefined;

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  requestHandler: requestHandler
});

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType?: string
): Promise<PutObjectCommandOutput> {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
}

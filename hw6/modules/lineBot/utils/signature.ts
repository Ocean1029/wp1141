import * as crypto from "crypto";
import { config } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Verify LINE webhook signature
 * 
 * LINE Platform signs webhook requests with HMAC-SHA256.
 * This function verifies that the request is authentic and from LINE.
 * 
 * @param body - Raw request body as string
 * @param signature - Signature from x-line-signature header
 * @returns True if signature is valid, false otherwise
 */
export function verifySignature(body: string, signature: string): boolean {
  try {
    const hash = crypto
      .createHmac("sha256", config.line.channelSecret)
      .update(body)
      .digest("base64");

    return hash === signature;
  } catch (error) {
    logger.error("Signature verification error", {
      signatureLength: signature.length,
      bodyLength: body.length,
    }, error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}


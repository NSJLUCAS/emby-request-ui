import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function getEncryptionKey() {
  const secret =
    (process.env.TELEGRAM_CONFIG_SECRET ?? "").trim() ||
    (process.env.ADMIN_SESSION_SECRET ?? "").trim() ||
    "dev-telegram-config-secret";

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptText(plainText: string) {
  const iv = crypto.randomBytes(IV_BYTES);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptText(cipherText: string) {
  const [ivRaw, tagRaw, dataRaw] = cipherText.split(".");
  if (!ivRaw || !tagRaw || !dataRaw) {
    throw new Error("Invalid cipher text format");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivRaw, "base64url");
  const tag = Buffer.from(tagRaw, "base64url");
  const encrypted = Buffer.from(dataRaw, "base64url");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

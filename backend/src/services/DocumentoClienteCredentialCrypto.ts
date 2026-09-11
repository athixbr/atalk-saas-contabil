import crypto from "crypto";

const getKey = (): Buffer => {
  const secretKey = process.env.CERT_PASSWORD_SECRET || "default-secret-key-change-me";
  return crypto.scryptSync(secretKey, "salt", 32);
};

export const encryptCredential = (value: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptCredential = (value: string): string => {
  const [ivHex, encrypted] = value.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), Buffer.from(ivHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

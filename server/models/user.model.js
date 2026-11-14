import mongoose from "mongoose";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"]
    },
    hashed_password: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  this.salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, this.salt, 64);
  this.hashed_password = hash.toString("hex");
};

userSchema.methods.authenticate = async function (password) {
  if (typeof password !== "string" || !this.salt || !this.hashed_password) {
    return false;
  }
  // Newly created accounts use scrypt (128 hexadecimal characters).
  if (this.hashed_password.length !== 128) return false;
  const candidate = await scrypt(password, this.salt, 64);
  const saved = Buffer.from(this.hashed_password, "hex");
  return saved.length === candidate.length && timingSafeEqual(saved, candidate);
};

export default mongoose.model("User", userSchema);

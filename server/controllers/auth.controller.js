import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import User from "../models/user.model.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

const signin = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select("+hashed_password +salt");
    if (!user || !(await user.authenticate(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
      algorithm: "HS256", expiresIn: "2h"
    });
    return res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not sign in" });
  }
};

// JWTs are stateless. Client must discard its token at signout.
// To invalidate tokens immediately, implement a denylist/session store.
const signout = (_req, res) => res.json({ message: "Signed out on client; discard the token" });

const requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
  getToken: (req) => {
    const value = req.headers.authorization;
    return value?.startsWith("Bearer ") ? value.slice(7) : null;
  }
});

const hasAuthorization = (req, res, next) => {
  if (!req.profile || !req.auth ||
      req.profile._id.toString() !== req.auth._id) {
    return res.status(403).json({ message: "Not authorized" });
  }
  return next();
};

export default { signin, signout, requireSignin, hasAuthorization };

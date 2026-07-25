import jwt from "jsonwebtoken";
import { ENV } from "../constants";

export interface JWTPayload {
  user: any;
  secretkey?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token with payload
 */
export const EncryptToken = (payload: any): string => {
  return jwt.sign(payload, ENV.JWT_SECRET);
};
/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid
 */
export const DecryptToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

/**
 * Decode JWT token without verification (for debugging purposes)
 */
export const JWTDecode = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = JWTDecode(token);
    if (!decoded || !decoded.exp) {
      return false; // No expiration time set
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
};

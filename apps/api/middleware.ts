import type { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import { JWT_PUBLIC_KEY } from "./config";
import type { AuthenticatedRequest } from "./types";

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Remove 'Bearer ' prefix if present
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY) as jwt.JwtPayload;
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.userID = decoded.sub;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// This is the decoded jwt
// {
//   "azp": "http://localhost:3000",
//   "exp": 1741951889,
//   "fva": [
//     60,
//     -1
//   ],
//   "iat": 1741951829,
//   "iss": "https://vast-impala-77.clerk.accounts.dev",
//   "nbf": 1741951819,
//   "sid": "sess_2uIu1pG4bDQS15DteM1vHn1tPR7",
//   "sub": "user_2uIu1k5IoD2UvyiFvWRbasN8g7k"      --> This is the userID that we need to verify
// }
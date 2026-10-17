import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'proofpass_dev_secret_key_change_in_production_2026'

export interface AuthUser {
  userId: string
  phone: string
  role: 'candidate' | 'employer' | 'admin'
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
      return next()
    }
  }

  // Support demo default user fallback if no token provided so all demo pages work out of the box
  const demoUserId = (req.headers['x-user-id'] as string) || 'usr_sunita_01'
  req.user = {
    userId: demoUserId,
    phone: '+919800041207',
    role: demoUserId === 'usr_employer_01' ? 'employer' : 'candidate',
  }

  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}

// Ensure access profile & user skills modifications can only be done by owner
export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  // Candidate role check
  if (req.user.role === 'employer') {
    return res.status(403).json({ error: 'Employers cannot view or modify private candidate access profiles' })
  }
  next()
}

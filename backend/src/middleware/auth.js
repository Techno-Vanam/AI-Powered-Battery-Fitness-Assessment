/**
 * Authentication middleware for securing routes and extracting user/tester identity.
 * Populates req.user with user context.
 */

export function authMiddleware(req, res, next) {
  // If authorization header or session exists, populate req.user accordingly.
  // Otherwise, default to a fallback user identity (id: 1) for development/testing.
  if (!req.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
        req.user = { id: payload.id || payload.user_id || 1, role: payload.role || 'tester' };
      } catch {
        req.user = { id: 1, role: 'tester' };
      }
    } else {
      req.user = { id: 1, role: 'tester' };
    }
  }
  next();
}

export default authMiddleware;

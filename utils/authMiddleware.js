const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const secret = process.env.JWT_SECRET;

const prisma = new PrismaClient();

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Missing authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Invalid authorization format' });

  try {
    const payload = jwt.verify(token, secret);
    // attach user record
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });
    req.user = user;
    
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
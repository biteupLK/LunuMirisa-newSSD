const { OAuth2Client } = require('google-auth-library');
const { UserModel } = require('../models/Users');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const protect = async (req, res, next) => {
  const authorization = req.header('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ message: 'Google authentication token is required' });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google authentication is not configured' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired Google authentication token' });
  }
};

async function resolveUserId(req) {
  const user = await UserModel.findOne({ email: req.user.email })
    .select('_id')
    .lean();

  return user?._id ?? null;
}

async function requireOwnUser(req, res, next) {
  try {
    const userId = await resolveUserId(req);

    if (!userId) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.params.id || String(userId) !== String(req.params.id)) {
      return res.status(403).json({ message: 'You are not allowed to access this user' });
    }

    req.authenticatedUserId = userId;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to authorize user' });
  }
}

module.exports = protect;
module.exports.protect = protect;
module.exports.resolveUserId = resolveUserId;
module.exports.requireOwnUser = requireOwnUser;
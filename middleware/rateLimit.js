/**
 * Simple in-memory rate limiter.
 * NOTE: This is per-process and resets on restart.
 */
const buckets = new Map();

const createRateLimiter = ({ windowMs, max, keyGenerator, message, onLimit }) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      if (typeof onLimit === 'function') {
        return onLimit(req, res);
      }
      return res.status(429).send(message || 'Too many attempts. Try again later.');
    }

    entry.count += 1;
    buckets.set(key, entry);
    return next();
  };
};

module.exports = { createRateLimiter };

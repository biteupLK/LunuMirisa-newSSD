function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeMongoKeys(value) {
  if (Array.isArray(value)) {
    value.forEach(sanitizeMongoKeys);
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || key === 'prototype') {
      delete value[key];
      continue;
    }
    sanitizeMongoKeys(value[key]);
  }
}

function mongoSanitize(req, res, next) {
  if (req.body) sanitizeMongoKeys(req.body);
  if (req.params) sanitizeMongoKeys(req.params);
  if (req.query) sanitizeMongoKeys(req.query);
  next();
}

module.exports = mongoSanitize;
module.exports.sanitizeMongoKeys = sanitizeMongoKeys;

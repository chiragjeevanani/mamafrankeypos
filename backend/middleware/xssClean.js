const clean = require('xss-clean/lib/xss').clean;

const xssClean = () => (req, res, next) => {
  if (req.body) {
    req.body = clean(req.body);
  }
  if (req.query) {
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        req.query[key] = clean(req.query[key]);
      }
    }
  }
  if (req.params) {
    for (const key in req.params) {
      if (Object.prototype.hasOwnProperty.call(req.params, key)) {
        req.params[key] = clean(req.params[key]);
      }
    }
  }
  next();
};

module.exports = xssClean;

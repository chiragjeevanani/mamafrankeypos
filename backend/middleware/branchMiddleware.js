/**
 * branchMiddleware.js
 *
 * Resolves the "active branch" for every request and attaches it to req.activeBranchId.
 *
 * Logic:
 *   - POS cashier / branch manager: their JWT has branchId → use that (cannot override).
 *   - Super Admin (branchId = null in JWT): reads ?branch=<id> query param or X-Branch-Id header.
 *       If value is 'all' or missing → req.activeBranchId = null (no branch filter = all branches).
 *       If value is a specific branch ID → req.activeBranchId = that ID.
 */
const resolveBranch = (req, res, next) => {
  if (req.branchId) {
    // POS cashier or branch-scoped staff: branch is locked to their account
    req.activeBranchId = req.branchId;
  } else {
    // Super Admin: branch determined by query param or custom header
    const queryBranch = req.query.branch || req.headers['x-branch-id'];
    if (queryBranch && queryBranch !== 'all') {
      req.activeBranchId = queryBranch;
    } else {
      req.activeBranchId = null; // null = no filter = all branches
    }
  }
  next();
};

module.exports = { resolveBranch };

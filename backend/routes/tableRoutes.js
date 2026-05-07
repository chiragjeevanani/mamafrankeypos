const express = require('express');
const router = express.Router();
const {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} = require('../controllers/tableController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/sections')
  .get(getSections)
  .post(protect, admin, createSection);

router.route('/sections/:id')
  .put(protect, admin, updateSection)
  .delete(protect, admin, deleteSection);

router.route('/')
  .get(getTables)
  .post(protect, admin, createTable);

router.route('/:id')
  .put(protect, admin, updateTable)
  .delete(protect, admin, deleteTable);

router.route('/:id/status')
  .patch(protect, updateTableStatus);

module.exports = router;

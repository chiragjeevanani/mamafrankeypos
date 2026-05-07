const Section = require('../models/Section');
const Table = require('../models/Table');

// --- Section Controllers ---

// @desc    Get all sections
// @route   GET /api/tables/sections
// @access  Public
const getSections = async (req, res) => {
  const sections = await Section.find({}).sort({ rank: 1 });
  res.json(sections);
};

// @desc    Create section
// @route   POST /api/tables/sections
// @access  Private/Admin
const createSection = async (req, res) => {
  const { name, label, rank } = req.body;

  const sectionExists = await Section.findOne({ name });

  if (sectionExists) {
    res.status(400);
    throw new Error('Section already exists');
  }

  const section = await Section.create({
    name,
    label,
    rank,
  });

  res.status(201).json(section);
};

// --- Table Controllers ---

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
const getTables = async (req, res) => {
  const tables = await Table.find({}).populate('section');
  res.json(tables);
};

// @desc    Create table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = async (req, res) => {
  const { name, section, capacity } = req.body;

  const table = await Table.create({
    name,
    section,
    capacity,
  });

  res.status(201).json(table);
};

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private
const updateTableStatus = async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    table.status = req.body.status || table.status;
    table.currentOrder = req.body.currentOrder || table.currentOrder;
    
    const updatedTable = await table.save();
    res.json(updatedTable);
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
};

// @desc    Update section
// @route   PUT /api/tables/sections/:id
// @access  Private/Admin
const updateSection = async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (section) {
    section.label = req.body.label || section.label;
    section.name = req.body.name || section.name;
    section.rank = req.body.rank !== undefined ? req.body.rank : section.rank;
    const updatedSection = await section.save();
    res.json(updatedSection);
  } else {
    res.status(404);
    throw new Error('Section not found');
  }
};

// @desc    Delete section
// @route   DELETE /api/tables/sections/:id
// @access  Private/Admin
const deleteSection = async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (section) {
    // Also delete tables in this section
    await Table.deleteMany({ section: section._id });
    await section.deleteOne();
    res.json({ message: 'Section and its tables removed' });
  } else {
    res.status(404);
    throw new Error('Section not found');
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (table) {
    table.name = req.body.name || table.name;
    table.section = req.body.section || table.section;
    table.capacity = req.body.capacity || table.capacity;
    table.status = req.body.status || table.status;
    const updatedTable = await table.save();
    res.json(updatedTable);
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (table) {
    await table.deleteOne();
    res.json({ message: 'Table removed' });
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
};

module.exports = {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
};

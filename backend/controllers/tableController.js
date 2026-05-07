const Section = require('../models/Section');
const Table = require('../models/Table');

const slugifySectionName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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
  const label = String(req.body.label || '').trim();
  const name = slugifySectionName(req.body.name || label);
  const rank = req.body.rank;

  if (!label) {
    res.status(400);
    throw new Error('Section label is required');
  }

  if (!name) {
    res.status(400);
    throw new Error('Section name is required');
  }

  const sectionExists = await Section.findOne({ name });

  if (sectionExists) {
    res.status(400);
    throw new Error('Section already exists');
  }

  const section = await Section.create({
    name,
    label,
    rank,
    status: req.body.status || 'Active',
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
  const name = String(req.body.name || '').trim().toUpperCase();
  const { section } = req.body;
  const capacity = Number(req.body.capacity ?? 4);

  if (!name) {
    res.status(400);
    throw new Error('Table name is required');
  }

  if (!section) {
    res.status(400);
    throw new Error('Table section is required');
  }

  if (!Number.isFinite(capacity) || capacity <= 0) {
    res.status(400);
    throw new Error('Capacity must be a positive number');
  }

  const sectionExists = await Section.findById(section);
  if (!sectionExists) {
    res.status(400);
    throw new Error('Selected section does not exist');
  }

  if (sectionExists.type === 'CAR-SERVICE') {
    res.status(400);
    throw new Error('Tables cannot be added to the Car Service section. It operates strictly by car numbers.');
  }

  const duplicateTable = await Table.findOne({ name, section });
  if (duplicateTable) {
    res.status(400);
    throw new Error('A table with this name already exists in the selected section');
  }

  const table = await Table.create({
    name,
    section,
    capacity,
  });

  const createdTable = await Table.findById(table._id).populate('section');
  res.status(201).json(createdTable);
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
    if (section.isSystem) {
      // Prevent changing core identity of system sections
      if (req.body.name !== undefined && req.body.name !== section.name) {
        res.status(400);
        throw new Error('Cannot change the system name of a protected section');
      }
      if (req.body.type !== undefined && req.body.type !== section.type) {
        res.status(400);
        throw new Error('Cannot change the type of a protected section');
      }
    }

    if (req.body.label !== undefined) {
      const label = String(req.body.label).trim();
      if (!label) {
        res.status(400);
        throw new Error('Section label is required');
      }
      section.label = label;
    }
    if (req.body.name !== undefined) {
      const name = slugifySectionName(req.body.name);
      if (!name) {
        res.status(400);
        throw new Error('Section name is required');
      }
      const existingSection = await Section.findOne({ name, _id: { $ne: section._id } });
      if (existingSection) {
        res.status(400);
        throw new Error('Section already exists');
      }
      section.name = name;
    }
    section.rank = req.body.rank !== undefined ? req.body.rank : section.rank;
    if (req.body.status !== undefined) section.status = req.body.status;
    if (req.body.type !== undefined) section.type = req.body.type;
    
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
    if (section.isSystem) {
      res.status(400);
      throw new Error('This is a dedicated system section and cannot be removed.');
    }
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
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim().toUpperCase();
      if (!name) {
        res.status(400);
        throw new Error('Table name is required');
      }
      table.name = name;
    }
    if (req.body.section !== undefined) {
      const sectionExists = await Section.findById(req.body.section);
      if (!sectionExists) {
        res.status(400);
        throw new Error('Selected section does not exist');
      }
      table.section = req.body.section;
    }
    if (req.body.capacity !== undefined) {
      const capacity = Number(req.body.capacity);
      if (!Number.isFinite(capacity) || capacity <= 0) {
        res.status(400);
        throw new Error('Capacity must be a positive number');
      }
      table.capacity = capacity;
    }
    if (req.body.status !== undefined) table.status = req.body.status;

    const duplicateTable = await Table.findOne({
      name: table.name,
      section: table.section,
      _id: { $ne: table._id }
    });
    if (duplicateTable) {
      res.status(400);
      throw new Error('A table with this name already exists in the selected section');
    }

    const updatedTable = await table.save();
    await updatedTable.populate('section');
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

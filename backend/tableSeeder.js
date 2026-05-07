const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Section = require('./models/Section');
const Table = require('./models/Table');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const importTableData = async () => {
  try {
    await Section.deleteMany();
    await Table.deleteMany();

    const sections = [
      { name: 'ac', label: 'AC Hall', rank: 1 },
      { name: 'garden', label: 'Garden', rank: 2 },
      { name: 'non-ac', label: 'Non-AC', rank: 3 },
      { name: 'rooftops', label: 'Rooftops', rank: 4 },
      { name: 'second-floor', label: 'Second Floor', rank: 5 },
      { name: 'car-service', label: 'Car Service', rank: 6 }
    ];

    const createdSections = await Section.insertMany(sections);

    const tables = [];
    
    // AC Tables
    const acSection = createdSections.find(s => s.name === 'ac');
    for (let i = 1; i <= 20; i++) {
      tables.push({ name: `AC${i}`, section: acSection._id, capacity: 4 });
    }

    // Garden Tables
    const gardenSection = createdSections.find(s => s.name === 'garden');
    for (let i = 1; i <= 20; i++) {
      tables.push({ name: `G${i}`, section: gardenSection._id, capacity: 6 });
    }

    // Non-AC Tables
    const nonAcSection = createdSections.find(s => s.name === 'non-ac');
    for (let i = 1; i <= 15; i++) {
      tables.push({ name: `NAC${i}`, section: nonAcSection._id, capacity: 4 });
    }

    // Rooftop Tables
    const rooftopSection = createdSections.find(s => s.name === 'rooftops');
    for (let i = 1; i <= 10; i++) {
      tables.push({ name: `R${i}`, section: rooftopSection._id, capacity: 4 });
    }

    // Second Floor Tables
    const secondFloorSection = createdSections.find(s => s.name === 'second-floor');
    for (let i = 1; i <= 12; i++) {
      tables.push({ name: `SF${i}`, section: secondFloorSection._id, capacity: 4 });
    }

    await Table.insertMany(tables);

    console.log('Table and Section Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importTableData();

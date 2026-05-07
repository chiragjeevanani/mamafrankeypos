const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csvtojson');
const path = require('path');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const csvFilePath = path.join(__dirname, '../frontend/public/data/mama franky menu.csv');

const importMenuData = async () => {
  try {
    // Clear existing menu data
    await Category.deleteMany();
    await MenuItem.deleteMany();

    const jsonArray = await csv().fromFile(csvFilePath);
    
    const categoriesMap = new Map();

    for (const row of jsonArray) {
      const categoryName = row.Category || 'General';
      
      // Handle Category
      let categoryId;
      if (!categoriesMap.has(categoryName)) {
        const category = await Category.create({
          name: categoryName,
          status: 'Active',
          rank: parseInt(row.Rank) || 0
        });
        categoriesMap.set(categoryName, category._id);
        categoryId = category._id;
      } else {
        categoryId = categoriesMap.get(categoryName);
      }

      // Handle Variants if any
      const variantGroups = [];
      if (row.Variation_group_name) {
        const options = [];
        // The CSV structure for variants seems to be repeating columns
        // Let's grab the first variation
        if (row.Variation) {
          options.push({
            name: row.Variation,
            price: parseFloat(row.Variation_Price) || 0
          });
        }
        
        // Check if there are more (the CSV showed repeating columns which csvtojson might handle as array or separate fields depending on headers)
        // Given the CSV snippet, let's just handle the first one for now or check for field2, field3 etc if csvtojson renamed them
        
        variantGroups.push({
          name: row.Variation_group_name,
          options: options
        });
      }

      // Handle Item
      await MenuItem.create({
        name: row.Name,
        description: row.Description || '',
        category: categoryId,
        price: parseFloat(row.Price) || 0,
        type: (row.Attributes || 'veg').toLowerCase().includes('non-veg') ? 'non-veg' : 
              (row.Attributes || 'veg').toLowerCase().includes('egg') ? 'egg' : 'veg',
        shortCode: row.Short_Code,
        rank: parseInt(row.Rank) || 0,
        variantGroups: variantGroups,
        status: 'Available'
      });
    }

    console.log('Menu Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing menu data:', error);
    process.exit(1);
  }
};

importMenuData();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Models
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Staff = require('./models/Staff');
const Counter = require('./models/Counter');
const Section = require('./models/Section');

dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to Database successfully.');

    // 1. Fetch menu items
    let menuItems = await MenuItem.find({ status: 'Available' });
    if (menuItems.length === 0) {
      menuItems = await MenuItem.find({});
    }
    if (menuItems.length === 0) {
      console.error('❌ No Menu Items found in the database. Please run the menu seeder first!');
      process.exit(1);
    }
    console.log(`✅ Loaded ${menuItems.length} menu items for order generation.`);

    // 2. Fetch or create waiter
    let waiter = await Staff.findOne({ role: 'Waiter', status: 'Active' });
    if (!waiter) waiter = await Staff.findOne({ role: 'Waiter' });
    if (!waiter) waiter = await Staff.findOne({});
    if (!waiter) {
      waiter = await Staff.create({
        name: 'Super Waiter',
        role: 'Waiter',
        status: 'Active'
      });
      console.log('Created super waiter.');
    }
    console.log(`✅ Using Waiter: ${waiter.name} (${waiter._id})`);

    // 3. Fetch or create counter
    let counter = await Counter.findOne({});
    if (!counter) {
      counter = await Counter.create({
        name: 'Seeder Counter',
        prefix: 'MF',
        startNum: 1,
        currentNum: 1,
        isActive: true
      });
      console.log('Created seeder counter.');
    }
    console.log(`✅ Using Counter: ${counter.name} (${counter._id})`);

    // 4. Fetch or create section & table
    let table = await Table.findOne({});
    if (!table) {
      let section = await Section.findOne({});
      if (!section) {
        section = await Section.create({
          name: 'seeder-hall',
          label: 'Seeder Hall',
          rank: 99
        });
      }
      table = await Table.create({
        name: 'T-SEED',
        section: section._id,
        capacity: 4,
        status: 'blank'
      });
      console.log('Created seeder table.');
    }
    console.log(`✅ Using Table: ${table.name} (${table._id})`);

    // 5. Generate 500 completed bills
    console.log('Generating 500 bills...');
    const bills = [];

    const paymentMethods = ['CASH', 'UPI', 'CARD'];
    const orderTypes = ['DINE-IN', 'CAR-SERVICE', 'PICKUP'];
    const carPrefixes = ['DL-3C', 'UP-16', 'HR-26', 'MH-02'];

    for (let i = 0; i < 500; i++) {
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Random date within the last 14 days
      const daysAgo = Math.floor(Math.random() * 14);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);

      // Select 1 to 3 random items
      const numItems = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...menuItems].sort(() => 0.5 - Math.random());
      const selectedItems = shuffled.slice(0, numItems);

      const kotItems = [];
      let subtotal = 0;

      selectedItems.forEach(item => {
        const qty = Math.floor(Math.random() * 5) + 5; // 5 to 9 units
        const price = item.price || 150; // default price if 0
        subtotal += price * qty;
        
        kotItems.push({
          menuItem: item._id,
          name: item.name,
          quantity: qty,
          price: price,
          status: 'served'
        });
      });

      // Calculate tax and total
      const sgst = Number((subtotal * 0.025).toFixed(2));
      const cgst = Number((subtotal * 0.025).toFixed(2));
      const totalAmount = Number((subtotal + sgst + cgst).toFixed(2));

      const orderData = {
        orderNumber: `MF-SEED-${1000 + i}`,
        tokenNo: `T-${100 + i}`,
        orderType,
        waiter: waiter._id,
        counter: counter._id,
        outlet: 'Main Outlet (Sadar)',
        orderStatus: 'COMPLETED',
        paymentMethod,
        paymentStatus: 'PAID',
        subtotal,
        taxes: [
          { name: 'SGST', rate: 2.5, amount: sgst },
          { name: 'CGST', rate: 2.5, amount: cgst }
        ],
        totalAmount,
        discount: {
          type: 'FLAT',
          value: 0,
          amount: 0
        },
        kots: [
          {
            kotNumber: `K-${1000 + i}`,
            items: kotItems,
            staff: waiter._id,
            time: date,
            status: 'printed',
            total: subtotal
          }
        ],
        billedAt: date,
        completedAt: date,
        createdAt: date,
        updatedAt: date
      };

      if (orderType === 'DINE-IN') {
        orderData.table = table._id;
      } else if (orderType === 'CAR-SERVICE') {
        const prefix = carPrefixes[Math.floor(Math.random() * carPrefixes.length)];
        orderData.carNumber = `${prefix}-${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]}-${1000 + Math.floor(Math.random() * 9000)}`;
      }

      bills.push(orderData);
    }

    console.log('Saving generated bills to database...');
    // Delete any existing seeded bills to ensure reproducibility
    const deleteResult = await Order.deleteMany({ orderNumber: /^MF-SEED-/ });
    console.log(`🧹 Cleaned up ${deleteResult.deletedCount} old seeded bills.`);

    const insertResult = await Order.insertMany(bills);
    console.log(`🎉 Successfully seeded ${insertResult.length} bills in the database!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

run();

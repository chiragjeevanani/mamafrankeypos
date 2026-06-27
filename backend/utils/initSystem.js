const Section = require('../models/Section');
const Order = require('../models/Order');
const Table = require('../models/Table');

const initSystem = async () => {
  try {
    // Check if Car Service section exists
    const carService = await Section.findOne({ name: 'car-service' });

    if (!carService) {
      await Section.create({
        name: 'car-service',
        label: 'Car Service',
        rank: 99,
        isSystem: true,
        type: 'CAR-SERVICE',
        status: 'Active'
      });
      console.log('System Initialization: Car Service section created.');
    } else {
      // Ensure it's marked as system if it already exists
      if (!carService.isSystem || carService.type !== 'CAR-SERVICE') {
        carService.isSystem = true;
        carService.type = 'CAR-SERVICE';
        await carService.save();
        console.log('System Initialization: Car Service section updated to system protection.');
      }
    }

    // Clean up stuck running/billed orders with 0 active items
    const activeOrders = await Order.find({ orderStatus: { $in: ['RUNNING', 'BILLED'] } });
    let cleanCount = 0;
    for (const order of activeOrders) {
      const activeItems = (order.kots || []).flatMap(k => k.items || []).filter(i => i.status !== 'cancelled');
      if (activeItems.length === 0) {
        order.orderStatus = 'CANCELLED';
        order.cancellationReason = 'Automatically cancelled: All items voided';
        order.cancelledAt = new Date();
        await order.save();

        if (order.table) {
          await Table.findByIdAndUpdate(order.table, {
            status: 'blank',
            currentOrder: null
          });
        }
        cleanCount++;
      }
    }
    if (cleanCount > 0) {
      console.log(`System Initialization: Cleaned up ${cleanCount} stuck empty orders.`);
    }
  } catch (error) {
    console.error('System Initialization Error:', error.message);
  }
};

module.exports = initSystem;

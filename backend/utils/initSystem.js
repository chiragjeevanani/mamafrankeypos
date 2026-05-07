const Section = require('../models/Section');

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
  } catch (error) {
    console.error('System Initialization Error:', error.message);
  }
};

module.exports = initSystem;

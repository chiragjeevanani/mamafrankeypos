const Counter = require('../models/Counter');

/**
 * Gets the next sequential number for a counter, resetting it to startNum if the day has changed.
 * This implementation is fully atomic and process-safe.
 */
const getDailySequenceNextValue = async (counterName, prefix = '', startNum = 1) => {
  const todayStr = new Date().toLocaleDateString('en-GB'); // "DD/MM/YYYY" format

  // 1. Try incrementing assuming today's date matches the counter's lastResetDate
  let counter = await Counter.findOneAndUpdate(
    { name: counterName, lastResetDate: todayStr },
    { $inc: { currentNum: 1 } },
    { new: true }
  );

  if (!counter) {
    // 2. If no record matches today's date, the day has changed OR the counter does not exist.
    // Reset the counter to startNum and update lastResetDate to todayStr.
    counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $set: { currentNum: startNum, lastResetDate: todayStr } },
      { new: true }
    );

    // 3. If the counter does not exist in the database at all, create it.
    if (!counter) {
      try {
        counter = await Counter.create({
          name: counterName,
          prefix: prefix || counterName,
          startNum: startNum,
          currentNum: startNum,
          lastResetDate: todayStr
        });
      } catch (err) {
        // Handle race condition if another thread created it concurrently
        counter = await Counter.findOneAndUpdate(
          { name: counterName },
          { $set: { currentNum: startNum, lastResetDate: todayStr } },
          { new: true }
        );
      }
    }
  }

  return counter.currentNum;
};

module.exports = {
  getDailySequenceNextValue
};

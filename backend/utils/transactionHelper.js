const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Executes operations inside a Mongoose database transaction if supported.
 * Automatically retries on transient transaction errors (like write conflicts) using withTransaction.
 * Falls back gracefully to non-transactional execution on standalone MongoDB instances.
 * @param {Function} callback - Async function to execute. Receives `session` as its argument.
 */
const runInTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result;
  } catch (error) {
    // Check if transaction is unsupported (typical for local standalone mongod)
    const isStandaloneError = 
      error.message && (
        error.message.includes('replica set') || 
        error.message.includes('Transaction numbers') ||
        error.code === 20 ||
        error.codeName === 'IllegalOperation'
      );

    if (isStandaloneError) {
      logger.warn('MongoDB Transactions are not supported in this environment (standalone server). Falling back to non-transactional execution.');
      // Fallback: Run standard execution without transaction session context
      return await callback(null);
    }
    
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { runInTransaction };

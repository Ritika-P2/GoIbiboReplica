const logger = require('../config/logger')

async function priceUpdater() {
  logger.info('Price updater ran (stub — integrate with pricing API)')
}

module.exports = { priceUpdater }

async function initiatePayment(_req, res) { res.status(501).json({ success: false, message: 'Not implemented' }) }

async function verifyPayment(_req, res) { res.status(501).json({ success: false, message: 'Not implemented' }) }

module.exports = { initiatePayment, verifyPayment }


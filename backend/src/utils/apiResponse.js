function successResponse(message, data = null, meta = null) {
  const response = { success: true, message }
  if (data !== null) response.data = data
  if (meta !== null) response.meta = meta
  return response
}

function errorResponse(message, errors = null) {
  const response = { success: false, message }
  if (errors !== null) response.errors = errors
  return response
}

module.exports = { successResponse, errorResponse }

const prisma = require('../config/database')
const { hashPassword, comparePassword } = require('../utils/hashPassword')

const SAFE_SELECT = {
  id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true,
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_SELECT })
  if (!user) {
    const err = new Error('User not found.')
    err.status = 404
    throw err
  }
  return user
}

async function updateProfile(userId, { name, phone, currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    const err = new Error('User not found.')
    err.status = 404
    throw err
  }

  const updateData = {}
  if (name) updateData.name = name
  if (phone !== undefined) updateData.phone = phone

  if (newPassword) {
    if (!currentPassword) {
      const err = new Error('Current password is required to set a new password.')
      err.status = 400
      throw err
    }
    const valid = await comparePassword(currentPassword, user.password)
    if (!valid) {
      const err = new Error('Current password is incorrect.')
      err.status = 401
      throw err
    }
    updateData.password = await hashPassword(newPassword)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: SAFE_SELECT,
  })
  return updated
}

module.exports = { getProfile, updateProfile }

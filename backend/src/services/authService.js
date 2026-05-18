const prisma = require('../config/database')
const { hashPassword, comparePassword } = require('../utils/hashPassword')
const { generateToken } = require('../utils/generateToken')

async function register({ name, email, password, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const err = new Error('Email already registered.')
    err.status = 409
    throw err
  }

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone: phone || null },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })

  const token = generateToken({ id: user.id, email: user.email, role: user.role })
  return { user, token }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const err = new Error('Invalid email or password.')
    err.status = 401
    throw err
  }

  const valid = await comparePassword(password, user.password)
  if (!valid) {
    const err = new Error('Invalid email or password.')
    err.status = 401
    throw err
  }

  const { password: _pw, ...safeUser } = user
  const token = generateToken({ id: safeUser.id, email: safeUser.email, role: safeUser.role })
  return { user: safeUser, token }
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
  })
  if (!user) {
    const err = new Error('User not found.')
    err.status = 404
    throw err
  }
  return user
}

module.exports = { register, login, getMe }

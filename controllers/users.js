const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users.map(u => u.toJSON()))
})

// eslint-disable-next-line consistent-return
usersRouter.post('/', async (request, response, next) => {
  try {
    const { body } = request

    if (body.password === undefined
    || body.password === null
    || body.password.length < 3) {
      return response
        .status(400)
        .json(
          { error: 'password is required and must be at least 3 chars' },
        )
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter

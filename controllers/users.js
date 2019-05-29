const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users.map(u => u.toJSON()))
})

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
        .end()
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    return response.json(savedUser)
  } catch (error) {
    return next(error)
  }
})

module.exports = usersRouter

const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const { body, token } = request

  try {
    const decodedToken = await jwt
      .verify(token, process.env.SECRET)
    if (!decodedToken || !decodedToken.id) {
      return response
        .status(401)
        .json({ error: 'token missing or invalid' })
        .end()
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    return response.status(201).json(savedBlog.toJSON())
  } catch (error) {
    return next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const { token } = request

  try {
    const decodedToken = await jwt
      .verify(token, process.env.SECRET)
    if (!decodedToken || !decodedToken.id) {
      return response
        .status(401)
        .json({ error: 'token missing or invalid' })
        .end()
    }

    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response
        .status(404)
        .json({ error: 'blog not found' })
        .end()
    }

    const tokenUser = blog.user
    if (JSON.stringify(user) === JSON.stringify(tokenUser)) {
      return response
        .status(401)
        .json({ error: 'wrong authentication' })
        .end()
    }

    await Blog.findByIdAndRemove(request.params.id)
    return response
      .status(204)
      .end()
  } catch (error) {
    return next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { body } = request

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog.toJSON())
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter

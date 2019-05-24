const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(blog => blog.toJSON()))
  /*
  Blog
    .find({})
    .then((blogs) => {
      response.json(blogs)
    })
    */
  
})

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  console.log('post', blog)

  blog
    .save()
    .then((result) => {
      response.status(201).json(result)
    })
    .catch(error => next(error))
})

module.exports = blogsRouter

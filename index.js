const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const middleware = require('./utils/middleware')
const config = require('./utils/config')


const app = express()
const Blog = require('./models/blog')

morgan
  .token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.use(cors())
app.use(bodyParser.json())

app.get('/api/blogs', (_request, response) => {
  Blog
    .find({})
    .then((blogs) => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response, next) => {
  const blog = new Blog(request.body)

  console.log('post', blog)

  blog
    .save()
    .then((result) => {
      response.status(201).json(result)
    })
    .catch(error => next(error))
})


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})

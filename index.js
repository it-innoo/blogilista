const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
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

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res
      .status(400)
      .send({ error: 'malformatted id' })
  } if (error.name === 'ValidationError') {
    return res
      .status(400)
      .json({ error: error.message })
  }

  return next(error)
}

app.use(errorHandler)


app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
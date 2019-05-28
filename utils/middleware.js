const logger = require('./logger')

const requestLogger = (request, _response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, _req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res
      .status(400)
      .send({ error: 'malformatted id' })
  } if (error.name === 'ValidationError') {
    return res
      .status(400)
      .json({ error: error.message })
  } if (error.name === 'JsonWebTokenError') {
    return res
      .status(401)
      .json({
        error: 'invalid token',
      })
  }

  return next(error)
}

const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
}

require('dotenv').config()

let { PORT } = process.env
let { MONGODB_URI } = process.env

if (process.env.NODE_ENV === 'test') {
  PORT = process.env.TEST_PORT
  MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
  MONGODB_URI,
  PORT,
}

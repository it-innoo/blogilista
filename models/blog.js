const mongoose = require('mongoose')
const config = require('../utils/config')

console.log(`connecting to ${config.MONGODB_URI}`)

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

blogSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Blog', blogSchema)

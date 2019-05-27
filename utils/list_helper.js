const Blog = require('../models/blog')

const dummy = () => 1

const totalLikes = blogs => blogs
  .map(blog => blog.likes)
  .reduce((total, amount) => total + amount, 0)

const favoriteBlog = (blogs) => {
  if (blogs === undefined || blogs === null || blogs.length === 0) {
    return {}
  }

  const max = blogs
    .reduce((prev, current) => ((prev.likes > current.likes)
      ? prev : current))

  const favorite = (({ title, author, likes }) => ({ title, author, likes }))(max)
  return favorite
}

const mostBlogs = (blogs) => {
  if (blogs === undefined || blogs === null || blogs.length === 0) {
    return {}
  }

  const authors = blogs
    .map(b => b.author)
    .reduce((obj, name) => {
      obj[name] = obj[name] ? (obj[name] + 1) : 1
      return obj
    }, {})

  const max = Object.entries(authors)
    .reduce((prev, current) => ((prev[1] > current[1])
      ? prev : current))

  return {
    author: max[0],
    blogs: max[1],
  }
}

const mostLikes = (blogs) => {
  if (blogs === undefined || blogs === null || blogs.length === 0) {
    return {}
  }

  const authors = blogs
    .map(b => ({
      author: b.author,
      likes: b.likes,
    }))

  const likes = authors
    .reduce((obj, name) => {
      obj[name.author] = obj[name.author]
        ? (obj[name.author] + name.likes)
        : name.likes
      return obj
    }, {})

  const max = Object.entries(likes)
    .reduce((prev, current) => ((prev[1] > current[1])
      ? prev : current))

  return {
    author: max[0],
    likes: max[1],
  }
}

module.exports = {
  dummy,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  totalLikes,
}

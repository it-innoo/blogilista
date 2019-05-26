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
  const counts = authors.reduce((obj, name) => {
    obj[name] = obj[name] ? (obj[name] + 1) : 1
    return obj
  }, {})

  const most = Object.entries(counts)

  let max = most[0]
  most.forEach((item) => {
    if (item[1] > max[1]) {
      max = item
    }
  })

  return {
    author: max[0],
    blogs: max[1],
  }
}

module.exports = {
  dummy,
  favoriteBlog,
  mostBlogs,
  totalLikes,
}

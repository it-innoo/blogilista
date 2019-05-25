const dummy = () => 1

const totalLikes = blogs => blogs
  .map(blog => blog.likes)
  .reduce((total, amount) => total + amount, 0)

const favoriteBlog = (blogs) => {
  if (blogs === undefined || blogs === null || blogs.length === 0) {
    return []
  }

  const max = blogs
    .reduce((prev, current) => ((prev.likes > current.likes)
      ? prev : current))

  const favorite = (({ title, author, likes }) => ({ title, author, likes }))(max)
  return favorite
}

module.exports = {
  dummy,
  favoriteBlog,
  totalLikes,
}

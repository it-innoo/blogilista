const dummy = () => 1

const totalLikes = blogs => blogs
  .map(blog => blog.likes)
  .reduce((total, amount) => total + amount, 0)

const favoriteBlog = (blogs) => {
  const [{
    _id, __v, url, ...favorites
  }] = blogs || [{ _id: '0', __v: '', url: '' }]

  return favorites
}

module.exports = {
  dummy,
  favoriteBlog,
  totalLikes,
}

process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

describe('tietokannassa on alunperin muutama blogi', () => {
  let userId
  beforeEach(async () => {
    await Blog.deleteMany({})

    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'sekret' })
    const savedUser = await user.save()
    userId = savedUser._id

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  test('identier is named id', async () => {
    const response = await api.get('/api/blogs')

    const ids = response.body.map(r => r.id)
    expect(ids).toBeDefined()
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const user = await User.findById(userId)

      const newBlog = {
        title: 'Async/Await',
        author: 'Me Luv',
        url: 'url',
        likes: 0,
        userId: user._id,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const title = blogsAtEnd.map(r => r.title)

      expect(blogsAtEnd.length)
        .toBe(helper.initialBlogs.length + 1)

      expect(title)
        .toContain(
          'Async/Await',
        )
    })

    test('likes defaults to zero', async () => {
      const user = await User.findById(userId)

      const newBlog = {
        title: 'Async/Await',
        author: 'Me Luv',
        url: 'url',
        userId: user._id,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const likes = blogsAtEnd
        .filter(r => r.title === 'Async/Await')
        .map(r => r.likes)

      expect(blogsAtEnd.length)
        .toBe(helper.initialBlogs.length + 1)

      expect(likes[0])
        .toBe(0)
    })

    test('fails with status code 400 if title invalid', async () => {
      const user = await User.findById(userId)

      const newBlog = {
        author: 'Me Luv',
        url: 'url',
        userId: user._id,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length)
        .toBe(helper.initialBlogs.length)
    })

    test('fails with status code 400 if url invalid', async () => {
      const user = await User.findById(userId)

      const newBlog = {
        title: 'Async/Await',
        author: 'Me Luv',
        userId: user._id,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length)
        .toBe(helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length)
        .toBe(helper.initialBlogs.length - 1)

      const title = blogsAtEnd.map(r => r.title)
      expect(title).not.toContain(blogToDelete.title)
    })

    test('fails with status code 400 if id is invalid', async () => {
      await api
        .delete('/api/blogs/1')
        .expect(400)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with valid params', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToModify = blogsAtStart[0]

      const { likes } = blogToModify
      blogToModify.likes += 1

      await api
        .put(`/api/blogs/${blogToModify.id}`)
        .send(blogToModify)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const blog = blogsAtEnd[0]
      expect(blog.likes).toBe(likes + 1)
    })
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('users are returned as json', async () => {
    const usersAtStart = await helper.usersInDb()

    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usernames = usersAtStart.map(u => u.username)
    expect(usernames).toContain('root')
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'newroot',
      name: 'Superuser',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with an existing username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with invalid username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jo',
      name: 'Superuser',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

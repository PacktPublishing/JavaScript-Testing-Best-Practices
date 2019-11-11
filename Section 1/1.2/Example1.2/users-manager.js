const axios = require('axios')
const NotFoundError = require('./errors/not-found-error')
const ValidationError = require('./errors/validation-error')

module.exports = class UsersManager {
  constructor () {
    this.baseUrl = 'https://jsonplaceholder.typicode.com'
  }

  async fetchResource (resourceName, identifier) {
    if (!resourceName) {
      throw new ValidationError(`Invalid resource ${resourceName}`)
    }
    let response = await axios.default.get(`${this.baseUrl}/${resourceName}/${identifier || ''}`, { validateStatus: false })
    if (response.status === 404 || !response.data) {
      if (identifier) {
        throw new NotFoundError(`${resourceName} with identifier ${identifier} not found`)
      } else {
        throw new NotFoundError(`${resourceName} not found`)
      }
    }
    return response.data
  }

  async fetchUsers () {
    return this.fetchResource('users')
  }

  async fetchUser (id) {
    return this.fetchResource('users', id)
  }

  async fetchPosts () {
    return this.fetchResource('posts')
  }

  async fetchPost (id) {
    return this.fetchResource('posts', id)
  }

  async fetchPostComments (postId) {
    let response = await axios.default.get(`${this.baseUrl}/posts/${postId}/comments`)
    if (response.status !== 400 || !response.data) {
      throw new NotFoundError(`Comments for post ${postId} not found`)
    }
    return response.data
  }

  async fetchComments () {
    return this.fetchResource('comments')
  }
}

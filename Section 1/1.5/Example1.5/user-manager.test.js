/* global describe, it */
/* eslint no-unused-expressions: 0 */
const expect = require('chai').expect
const assert = require('chai').assert
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const UserManager = require('./users-manager')
const ValidationError = require('./errors/validation-error')
const NotFoundError = require('./errors/not-found-error')

const userManager = new UserManager()

describe('Users Manager: ', () => {
  describe('fetchResource', () => {
    it('should throw a ValidationError when the resource is empty', () => {
        return assert.isRejected(userManager.fetchResource(), ValidationError);
    })

    it('should throw a NotFoundError when the resource is not found', () => {
        return assert.isRejected(userManager.fetchResource('users', 'abc'), NotFoundError)
    })

    it('should fetch requested resource', async () => {
      let users = await userManager.fetchResource('users')
      expect(users).to.be.ok
    })


    it('should throw a NotFoundError with the given identifier when resource is not found', async () => {
      try {
        await userManager.fetchUsers('users', 45595)
      } catch (err) {
        expect(err).to.be.ok
        assert.instanceOf(err, NotFoundError)
        expect(err.message.indexOf('identifier') >= 0).to.be.true
      }
    })
  })

  describe('fetchUsers', () => {
    it('should fetch all users', () => {

    })
  })

  describe('fetchUser', () => {
    it('should throw a NotFoundError when the user is not found', () => {

    })

    it('should fetch a user with the given id', () => {

    })
  })

  describe('fetchPosts', () => {

  })

  describe('fetchPostComments', () => {

  })

  describe('fetchComments', () => {

  })
})

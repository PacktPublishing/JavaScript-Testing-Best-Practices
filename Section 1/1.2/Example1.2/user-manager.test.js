const expect = require("chai").expect;
const assert = require("chai").assert;
const UserManager = require("./users-manager");
const ValidationError = require("./errors/validation-error");
const NotFoundError = require("./errors/not-found-error");

const userManager = new UserManager();

describe("Users Manager: ", () => {

    describe("fetchResource", () => {
        it("should fetch requested resource", async() => {
            let users = await userManager.fetchResource("users");
            expect(users).to.be.ok;
        });

        it("should throw a ValidationError when the resource is empty", async() =>{
            try {
                await userManager.fetchResource("w");
            } catch(err) {
                expect(err).to.be.ok;
                assert.instanceOf(err, ValidationError);
            }
        });

        it("should throw a NotFoundError when the resource is not found", async() => {
            try {
                await userManager.fetchResource("users", "abc");
            } catch (err) {
                expect(err).to.be.ok;
                assert.instanceOf(err, NotFoundError);
            }
        });
    });

    describe("fetchUsers", () => {
        it("should fetch all users", () => {

        });
    });

    describe("fetchUser", () => {
        it("should throw a NotFoundError when the user is not found", () => {

        });
        
        it("should fetch a user with the given id", () => {

        });

    });

    describe("fetchPosts", () => {

    });

    describe("fetchPostComments", () => {

    });

    describe("fetchComments", () => {

    });

});
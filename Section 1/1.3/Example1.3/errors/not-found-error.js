module.exports = class NotFoundError extends Error {
    constructor(errorMsg) {
        super(errorMsg);
    }
}
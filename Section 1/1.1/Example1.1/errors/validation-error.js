module.exports = class ValidationError extends Error {
    constructor(msg) {
        super(msg);
    }
}
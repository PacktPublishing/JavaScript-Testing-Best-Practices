const chai = require("chai");
const resizer = require("./resizer");
const expect = chai.expect;
const assert = chai.assert;
const fs = require("fs");
const promisify = require("util").promisify;

describe("resizer: ", () => {
    it("should throw an error when given an invalid path", async() => {
        try {
            await resizer();
            assert.fail("Should have failed");
        }
        catch(err) {
            expect(err).to.be.ok;
            expect(err.message).to.equal("Source is missing");
        }
    });

    it("should fail when not given an output path", async() => {
        try {
            await resizer("some_file.png");
            assert.fail("Should have failed");
        }
        catch(err) {
            expect(err).to.be.ok;
            expect(err.message).to.equal("Output is missing");
        }
    });

    it("should fail when given image does not exist", async() => {
        try {
            await resizer("whatever.png", "whatever-half.png");
            assert.fail("Should have failed");
        }
        catch(err) {
            expect(err).to.be.ok;
            expect(err.message).to.equal("Image does not exist");
        }
    });

    it("should resize image in half resulting in less size", async() => {
        let source = "html5_logo.png";
        let output = "html5_logo-half.png";
        await resizer(source, output);
        let sourceStat = await promisify(fs.stat)(source);
        let sourceSize = sourceStat.size;
        let outputStat = await promisify(fs.stat)(output);
        let outputSize = outputStat.size;
        expect(sourceSize).to.be.greaterThan(outputSize);
    });
});
const assert = require("assert");
const { Given, When, Then } = require("cucumber");
const resizer = require("../../resizer");
const promisify = require("util").promisify;
const fs = require("fs");

let sourceFileName = "";
let destinationFileName = "";

Given("The source file {string}", function(source) {
    sourceFileName = source;
});

Given("The destination file {string}", function(destination) {
    destinationFileName = destination;
});

When("We resize the source file", async function() {
    await resizer(sourceFileName, destinationFileName);
});

Then("The destination file should be smaller", async function() {
    let sourceStat = await promisify(fs.stat)(sourceFileName);
    let sourceSize = sourceStat.size;
    let outputStat = await promisify(fs.stat)(destinationFileName);
    let outputSize = outputStat.size;
    assert(outputSize < sourceSize);
});
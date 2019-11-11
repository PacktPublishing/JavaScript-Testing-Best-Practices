const jimp = require("jimp");
const fs = require("fs");
const promisify = require("util").promisify;

function checkSource(source) {
    if (!source) {
        throw new Error("Source is missing");
    }
}

async function checkSourceExistence(source) {
    if (!await promisify(fs.exists)(source)) {
        throw new Error("Image does not exist");
    }
}

function checkOutput(output) {
    if (!output) {
        throw new Error("Output is missing");
    }
}

function getWidthHeight(img) {
    let width = img.getWidth();
    let height = img.getHeight();
    return { width, height };
}


module.exports = async function resizer(source, output) {
    checkSource(source);
    checkOutput(output);
    await checkSourceExistence(source);
    let img = await jimp.read(source);
    let { width, height } = getWidthHeight(img);
    let newWidth = Math.ceil(width / 2);
    let newHeight = Math.ceil(height / 2);
    let newImg = await img.resize(newWidth, newHeight);
    await newImg.writeAsync(output);
}




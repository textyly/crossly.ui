import fs from "fs-extra";

try {
    console.log("start copying...");

    withIndexPage();

    withAssets();

    withStyles();

    console.log("copying succeed.");
} catch (err) {
    console.error(err);
}

function withIndexPage() {
    console.log("copying index.html files to dist...");
    fs.copyFileSync("./src/index.html", "./dist/index.html");
}

function withAssets() {
    console.log("copying rest of the html files to dist...");
    fs.copySync("./assets", "./dist/assets");
}

function withStyles() {
    console.log("copying styles to dist...");
    fs.copySync("./src/styles", "./dist/styles");
}
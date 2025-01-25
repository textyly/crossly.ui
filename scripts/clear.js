import fs from "fs-extra";

try {
    console.log("start clearing...");

    clearDist();

    clearDistTests();

    clearNodeModules();

    clearPackageLock();

    console.log("clear succeed.");
} catch (err) {
    console.error(err);
}

function clearDist() {
    console.log("clearing dist...");
    fs.removeSync("./dist");
}

function clearDistTests() {
    console.log("clearing dist-tests...");
    fs.removeSync("./dist-tests");
}

function clearNodeModules() {
    console.log("clearing node modules...");
    fs.removeSync("./node_modules");
}

function clearPackageLock() {
    console.log("clearing package-lock.json...");
    fs.removeSync("./package-lock.json");
}
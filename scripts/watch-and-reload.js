import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("Watching for HTML and CSS changes...");

// Create WebSocket server for live reload
const wss = new WebSocketServer({ port: 35729 });
const clients = new Set();

wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Browser connected for live reload");
    
    ws.on("close", () => {
        clients.delete(ws);
    });
});

// Initial copy
copyFiles();

// Watch for changes
const srcDir = path.join(rootDir, "src");

// Watch index.html
fs.watch(path.join(srcDir, "index.html"), (eventType, filename) => {
    if (filename) {
        console.log(`${filename} changed, copying...`);
        copyIndexPage();
        notifyReload();
    }
});

// Watch styles directory
fs.watch(path.join(srcDir, "styles"), { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".css")) {
        console.log(`${filename} changed, copying...`);
        copyStyles();
        notifyReload();
    }
});

// Watch icons directory
fs.watch(path.join(srcDir, "icons"), { recursive: true }, (eventType, filename) => {
    if (filename) {
        console.log(`${filename} changed, copying...`);
        copyIcons();
        notifyReload();
    }
});

console.log("Watcher started. Press Ctrl+C to stop.");
console.log("Live reload server running on port 35729");

function copyFiles() {
    copyIndexPage();
    copyAssets();
    copyStyles();
    copyIcons();
    copyDebug();
}

function copyIndexPage() {
    try {
        fs.copyFileSync("./src/index.html", "./dist/index.html");
        console.log("✓ index.html copied");
    } catch (err) {
        console.error("✗ Error copying index.html:", err);
    }
}

function copyAssets() {
    try {
        fs.copySync("./assets", "./dist/assets");
        console.log("✓ assets copied");
    } catch (err) {
        console.error("✗ Error copying assets:", err);
    }
}

function copyStyles() {
    try {
        fs.copySync("./src/styles", "./dist/styles");
        console.log("✓ styles copied");
    } catch (err) {
        console.error("✗ Error copying styles:", err);
    }
}

function copyIcons() {
    try {
        fs.copySync("./src/icons", "./dist/icons");
        console.log("✓ icons copied");
    } catch (err) {
        console.error("✗ Error copying icons:", err);
    }
}

function copyDebug() {
    try {
        fs.copySync("./src/debug", "./dist/debug");
        console.log("✓ debug copied");
    } catch (err) {
        console.error("✗ Error copying debug:", err);
    }
}

function notifyReload() {
    setTimeout(() => {
        console.log(`Notifying ${clients.size} client(s) to reload...`);
        clients.forEach((client) => {
            if (client.readyState === 1) { // OPEN
                client.send("reload");
            }
        });
    }, 100);
}


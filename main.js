console.log("mainjs loaded");

const { app, BrowserWindow, ipcMain } = require("electron/main");
const { execFile } = require('child_process');
const fs = require("fs");
const path = require("path");

const JSON_PATH =
    "/home/immasushiroll/Windows/Users/jane8/repos/financial-tracker/data.json";

// fs.readFile(JSON_PATH, "utf8", (err, data) => {
//     if (err) {
//         console.log("File read failed:", err);
//         return;
//     }
//     console.log("File data:", data);
// });

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        }
    });

    win.loadFile("index.html");
}

app.whenReady().then(createWindow);

// ipcMain is an Event Emitter that handles asynchronous and synchronous messages sent from a web page 
// save-to-json is the channel name, from preload.js
ipcMain.on("save-to-json", (event, value) => {
    // if (typeof value !== "object" || value === null) {
    //     return;
    // }

    // fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
    console.log("IPC received:", value);
    let data = [];
    if (fs.existsSync(JSON_PATH)) {
        try {
            data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
        } catch (err) {
            console.error("Invalid JSON:", err);
            return;
        }
    }

    // this is where the actual "data" schema can be defined
    data.push({
        ...value,
        Timestamp: new Date().toISOString()
    });

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
});

ipcMain.on("router", (event, value) => {
    win.loadFile("transactions.html");
});

// .handle is more for a request-response event than an event that just happens like in .on
ipcMain.handle("get-transactions-json", async () => {
    const filePath = path.join(__dirname, "data.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(rawData);
});

app.on("window-all-closed", () => {
    app.quit();
});

ipcMain.handle('extract-text', async (event, imageBuffer) => {
    // write buffer to a temp file, then call your python script
    console.log("extracting text...");
    return new Promise((resolve, reject) => {
    execFile('python3', ['writer.py', '--extract', tempImagePath], (err, stdout) => {
        if (err) return reject(err);
        resolve({ text: stdout });
    });
    });
});
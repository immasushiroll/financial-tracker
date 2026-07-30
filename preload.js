console.log("preload loaded");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveToJSON: (data) => ipcRenderer.send("save-to-json", data),
    router: (page) => ipcRenderer.send("router", page),
    getTransactionsJSON: () => ipcRenderer.invoke("get-transactions-json"),
    extractText: (imageBuffer) => ipcRenderer.invoke('extract-text', imageBuffer),
    processTransaction: (formData) => ipcRenderer.invoke('process-transaction', formData)
});
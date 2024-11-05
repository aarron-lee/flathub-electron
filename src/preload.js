const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronUtils", {
  navButtonClicked: (buttonName) =>
    ipcRenderer.send("navButtonClicked", buttonName),
});

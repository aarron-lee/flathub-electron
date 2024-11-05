const { app, BrowserWindow } = require("electron");
const path = require("path");
const { registerTab, TAB_NAMES } = require("./src/navigation");
const removeApps = require("./src/removeApps");
const flathub = require("./src/flathub");
const { createMenu } = require("./src/menu");

async function createWindow() {
  const win = new BrowserWindow({
    minWidth: 800,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
  });

  registerTab(TAB_NAMES.ROOT, win);
  registerTab(TAB_NAMES.REMOVE, removeApps.renderRemoveAppsPage(win));
  registerTab(TAB_NAMES.FLATHUB, flathub.renderFlathub(win, true));
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const { app, BrowserWindow } = require("electron");
const path = require("path");
const navigation = require("./src/navigation");
const removeApps = require("./src/removeApps");
const flathub = require("./src/flathub");
const { createMenu } = require("./src/menu");

async function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
  });

  navigation.registerTab("ROOT", win);
  navigation.registerTab("REMOVE", removeApps.renderRemoveAppsPage(win));
  navigation.registerTab("FLATHUB", flathub.renderFlathub(win, true));
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

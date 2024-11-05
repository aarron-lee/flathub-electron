const { app, BrowserWindow } = require("electron");
const path = require("path");
const navigation = require("./src/navigation");
const removeApps = require("./src/removeApps");
const flathub = require("./src/flathub");
const { createMenu } = require("./src/menu");

const TABS = {
  CURRENT: "",
};

async function createWindow() {
  navigation.saveTabs(TABS);

  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
  });

  TABS.ROOT = win;
  TABS.REMOVE = removeApps.renderRemoveAppsPage(win);
  TABS.FLATHUB = flathub.renderFlathub(win, true);

  TABS.CURRENT = "FLATHUB";
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

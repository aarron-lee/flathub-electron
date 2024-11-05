const { BrowserView } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");

let TABS;

function saveTabs(tabs) {
  TABS = tabs;
}

ipcMain.on("navButtonClicked", (_, buttonName) => {
  if (buttonName === "FLATHUB") {
    if (TABS.CURRENT === "FLATHUB") {
      // already on flathub page, navigate to flathub.org home
      TABS.FLATHUB.webContents.loadURL("https://flathub.org");
    } else if (TABS.CURRENT === "REMOVE") {
      TABS.ROOT?.removeBrowserView(TABS.REMOVE);
      TABS.ROOT?.addBrowserView(TABS.FLATHUB);
      TABS.CURRENT = "FLATHUB";
    }
  }
  if (buttonName === "REMOVE") {
    if (TABS.CURRENT === "FLATHUB") {
      TABS.ROOT?.removeBrowserView(TABS.FLATHUB);
      TABS.ROOT?.addBrowserView(TABS.REMOVE);
      TABS.CURRENT = "REMOVE";
    }
  }
});

function renderNavigation(browserWindow, show = false) {
  const navigation = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  navigation.webContents.loadFile(
    path.join(__dirname, "../static/navigation.html")
  );

  navigation.setBounds({
    x: 0,
    y: 0,
    width: browserWindow.getBounds().width,
    height: 36,
  });
  navigation.setAutoResize({
    width: true,
    height: true,
    horizontal: false,
    vertical: false,
  });

  if (show) browserWindow.addBrowserView(navigation);

  return navigation;
}

module.exports = { renderNavigation, saveTabs };

const { BrowserView } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");

let TABS;

function saveTabs(tabs) {
  TABS = tabs;
}

ipcMain.on("navButtonClicked", (_, buttonName) => {
  return navigateTo(buttonName);
});

function navigateTo(tabName, options = {}) {
  if (tabName === "FLATHUB") {
    if (TABS.CURRENT === "FLATHUB") {
      // already on flathub page, navigate to flathub.org home
      TABS.FLATHUB.webContents.loadURL("https://flathub.org");
    } else if (TABS.CURRENT === "REMOVE") {
      const { targetUrl } = options;

      TABS.ROOT?.removeBrowserView(TABS.REMOVE);

      TABS.FLATHUB?.setBounds({
        x: 0,
        y: 36,
        width: TABS.ROOT.getBounds().width,
        height: TABS.ROOT.getBounds().height - 36,
      });
      TABS.FLATHUB?.setAutoResize({
        width: true,
        height: true,
        horizontal: false,
        vertical: false,
      });

      if (targetUrl) {
        TABS.FLATHUB.webContents.loadURL(targetUrl);
      }

      TABS.ROOT?.addBrowserView(TABS.FLATHUB);
      TABS.CURRENT = "FLATHUB";
    }
  }
  if (tabName === "REMOVE") {
    if (TABS.CURRENT === "FLATHUB") {
      TABS.ROOT?.removeBrowserView(TABS.FLATHUB);

      TABS.REMOVE?.setBounds({
        x: 0,
        y: 36,
        width: TABS.ROOT.getBounds().width,
        height: TABS.ROOT.getBounds().height - 36,
      });
      TABS.REMOVE?.setAutoResize({
        width: true,
        height: true,
        horizontal: false,
        vertical: false,
      });

      TABS.ROOT?.addBrowserView(TABS.REMOVE);
      TABS.CURRENT = "REMOVE";
    }
  }
}
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

module.exports = { renderNavigation, saveTabs, navigateTo };

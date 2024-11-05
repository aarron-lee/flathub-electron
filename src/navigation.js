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
      // already on flathub tab, Go Back instead
      TABS.FLATHUB.webContents.goBack();
    } else if (TABS.CURRENT === "REMOVE") {
      const { targetUrl } = options;

      TABS.ROOT?.removeBrowserView(TABS.REMOVE);

      TABS.FLATHUB?.setBounds({
        x: 0,
        y: 0,
        width: TABS.ROOT.getBounds().width,
        height: TABS.ROOT.getBounds().height,
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
        y: 0,
        width: TABS.ROOT.getBounds().width,
        height: TABS.ROOT.getBounds().height,
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

module.exports = { saveTabs, navigateTo };

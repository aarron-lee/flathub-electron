const { ipcMain } = require("electron");

const TABS = {
  CURRENT: "FLATHUB",
};

ipcMain.on("navButtonClicked", (_, buttonName) => {
  return navigateTo(buttonName);
});

function getTabs() {
  return TABS;
}

function registerTab(tabName, tab) {
  TABS[tabName] = tab;
}

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

module.exports = { registerTab, getTabs, navigateTo };

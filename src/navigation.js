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

const TAB_NAMES = {
  ROOT: "ROOT",
  REMOVE: "REMOVE",
  FLATHUB: "FLATHUB",
};

function navigateTo(tabName, options = {}) {
  if (tabName === TAB_NAMES.FLATHUB) {
    if (TABS.CURRENT === TAB_NAMES.FLATHUB) {
      // already on flathub tab, Go Back instead
      TABS.FLATHUB.webContents.goBack();
    } else if (TABS.CURRENT === TAB_NAMES.REMOVE) {
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
      TABS.CURRENT = TAB_NAMES.FLATHUB;
    }
  }
  if (tabName === TAB_NAMES.REMOVE) {
    if (TABS.CURRENT === TAB_NAMES.FLATHUB) {
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
      TABS.CURRENT = TAB_NAMES.REMOVE;
    }
  }
}

module.exports = { TAB_NAMES, registerTab, getTabs, navigateTo };

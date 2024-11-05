const { BrowserView } = require("electron");
const path = require("path");

function renderRemoveAppsPage(browserWindow, show = false) {
  const removeApps = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "./preload.js"),
    },
  });
  removeApps.webContents.loadFile(
    path.join(__dirname, "../static/removeApps.html")
  );

  removeApps.setBounds({
    x: 0,
    y: 36,
    width: browserWindow.getBounds().width,
    height: browserWindow.getBounds().height - 36,
  });
  removeApps.setAutoResize({
    width: true,
    height: true,
    horizontal: false,
    vertical: false,
  });

  if (show) browserWindow.addBrowserView(removeApps);

  return removeApps;
}

module.exports = {
  renderRemoveAppsPage,
};

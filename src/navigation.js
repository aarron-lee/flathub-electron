const { BrowserView } = require("electron");
const path = require("path");

function renderNavigation(browserWindow) {
  const navigation = new BrowserView({
    webPreferences: {
      // devTools: isDev,
      // enableRemoteModule: false,
      contextIsolation: true,
      nodeIntegration: false,
      // preload: __dirname + "/client-preload.js",
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

  browserWindow.addBrowserView(navigation);

  return navigation;
}

module.exports = { renderNavigation };

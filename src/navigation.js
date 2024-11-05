const { BrowserView } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");

ipcMain.on("navButtonClicked", (_, buttonName) => {
  console.log(buttonName);
  //   handleGamepadButtonPress(mainWindow, buttonName);
});

// tabs.NAVIGATION;
// tabs.FLATHUB;
// tabs.REMOVE;

function renderNavigation(browserWindow, tabs) {
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

  browserWindow.addBrowserView(navigation);

  return navigation;
}

module.exports = { renderNavigation };

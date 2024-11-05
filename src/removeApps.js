const { BrowserView, ipcMain } = require("electron");
const path = require("path");
const { spawnSync } = require("child_process");

let removeAppsPage;

function renderRemoveAppsPage(browserWindow, show = false) {
  removeAppsPage = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "./preload.js"),
    },
  });
  removeAppsPage.webContents.loadFile(
    path.join(__dirname, "../static/removeApps.html")
  );

  removeAppsPage.setBounds({
    x: 0,
    y: 36,
    width: browserWindow.getBounds().width,
    height: browserWindow.getBounds().height - 36,
  });
  removeAppsPage.setAutoResize({
    width: true,
    height: true,
    horizontal: false,
    vertical: false,
  });

  if (show) browserWindow.addBrowserView(removeAppsPage);

  ipcMain.addListener("refreshAppList", () => {
    const flatpakList = runFlatpakList();
    removeAppsPage.webContents.send("appList", flatpakList);
  });

  return removeAppsPage;
}

function parseFlatpakList(output) {
  const lines = output.split("\n");

  const dataLines = lines.filter((line) => line?.trim() !== "");

  return dataLines.map((line) => {
    const [name, appId, version, branch, installType] = line
      .split("\t")
      .map((p) => p?.trim());

    return {
      name,
      appId,
      version,
      branch,
      installType,
    };
  });
}

function runFlatpakList() {
  let apps = [];

  try {
    const result = spawnSync("flatpak", ["list", "--app"]);

    apps = parseFlatpakList(result.stdout.toString());
  } catch (e) {
    console.error("Error while fetching flatpak list: ", e);
  }

  return apps;
}

module.exports = {
  renderRemoveAppsPage,
};

const { BrowserView, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { navigateTo } = require("./navigation");

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
    path.join(__dirname, "../static/removeApps.html"),
  );

  removeAppsPage.setBounds({
    x: 0,
    y: 0,
    width: browserWindow.getBounds().width,
    height: browserWindow.getBounds().height,
  });
  removeAppsPage.setAutoResize({
    width: true,
    height: true,
    horizontal: false,
    vertical: false,
  });

  if (show) browserWindow.addBrowserView(removeAppsPage);

  addListeners(removeAppsPage);

  return removeAppsPage;
}

const sendAppListToFrontend = () => {
  if (removeAppsPage) {
    const flatpakList = runFlatpakList();
    removeAppsPage.webContents.send("appList", flatpakList);
  }
};

function addListeners(removeAppsPage) {
  ipcMain.addListener("refreshAppList", () => {
    const flatpakList = runFlatpakList();
    removeAppsPage.webContents.send("appList", flatpakList);
  });

  ipcMain.addListener("showAppInfo", (_, appId) => {
    console.log(appId);
    return navigateTo("FLATHUB", {
      targetUrl: `https://flathub.org/apps/${appId}`,
    });
  });

  ipcMain.addListener("removeApp", (_, app) => {
    console.log("removeApp", app);
    const { name, appId, installType } = app;

    const terminal = spawn(
      "flatpak",
      [
        "remove",
        installType.indexOf("system") >= 0 ? "--system" : "--user",
        "--noninteractive",
        "-y",
        appId,
      ],
      {
        shell: true,
      },
    );

    let error = false;

    terminal.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);

      dialog.showMessageBox({
        title: "Error",
        type: "error",
        message: `Uninstall failed with error:\n ${data}`,
      });
      error = true;

      removeAppsPage.webContents.send("resumeRefreshAppList");
    });

    terminal.on("close", (code) => {
      console.log(`child process exited with code ${code}`);

      if (code === 0 && !error) {
        dialog.showMessageBox({
          title: "Removal Complete",
          type: "info",
          message: `${name} remove complete`,
        });

        removeAppsPage.webContents.send("resumeRefreshAppList");
      }
    });
  });
}

function parseFlatpakList(output) {
  const lines = output.split("\n");

  const dataLines = lines.filter((line) => line?.trim() !== "");

  return dataLines.map((line) => {
    const [name, appId, version, branch, origin, installType] = line
      .split("\t")
      .map((p) => p?.trim());

    const result = {
      name,
      appId,
      version,
      branch,
      origin,
      installType,
    };

    return result;
  });
}

function runFlatpakList() {
  let apps = [];

  try {
    const result = spawnSync("flatpak", [
      "list",
      "--app",
      "--columns=name,application,version,branch,origin,installation",
    ]);

    apps = parseFlatpakList(result.stdout.toString());
  } catch (e) {
    console.error("Error while fetching flatpak list: ", e);
  }

  return apps;
}

module.exports = {
  renderRemoveAppsPage,
  sendAppListToFrontend,
};

const { app, BrowserWindow } = require("electron");
const { dialog } = require("electron");
const { exec, spawn } = require("child_process");

const APP_INSTALL_TYPE = {
  Cancel: 0,
  User: 1,
  System: 2,
};

async function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);

  await win.loadURL("https://flathub.org/", {});

  win.webContents.on("will-navigate", async (event) => {
    const url = new URL(event.url);

    const validOrigins = ["https://dl.flathub.org", "https://flathub.org"];

    if (!validOrigins.includes(url.origin)) {
      event.preventDefault();
    }

    if (url.host == "dl.flathub.org" && url.pathname.includes(".flatpakref")) {
      event.preventDefault();

      const flatpakRef = url.pathname
        .split("/")
        .pop()
        .replace(".flatpakref", "");

      const installType = await getAppInstallType();

      if (installType === APP_INSTALL_TYPE.Cancel) {
        return;
      }

      const terminal = spawn(
        "flatpak",
        [
          "install",
          "flathub",
          installType === APP_INSTALL_TYPE.User ? "--user" : "--system",
          "--noninteractive",
          "-y",
          flatpakRef,
        ],
        {
          shell: true,
        }
      );

      createLoadingDialog(win);

      let error = false;

      terminal.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);

        dialog.showMessageBox({
          title: "Error",
          type: "error",
          message: `Installation failed with error:\n ${data}`,
        });
        error = true;

        removeLoadingDialog(win);
      });

      terminal.on("close", (code) => {
        console.log(`child process exited with code ${code}`);

        if (code === 0 && !error) {
          dialog.showMessageBox({
            title: "Install Complete",
            type: "info",
            message: "Installation complete",
          });
        }
        removeLoadingDialog(win);
      });
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function createLoadingDialog(win) {
  const cmd = `
    var createDialog = () => {
      const dialog = document.createElement("dialog");
      dialog.setAttribute("id", "install-in-progress-dialog");
      dialog.setAttribute(
        "style",
        \`
        position: fixed;
        top: 50%;
        margin-left:auto;
        margin-right:auto;
        background: rgba(0,0,0,0.5);
        border-radius: 50%;
      \`
      );

      dialog.innerHTML = \`<style>
      #electronLoadingSpinner {
        border: 16px solid #f3f3f3; /* Light grey */
        border-top: 16px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    <div id="electronLoadingSpinner"></div>\`;

      document.body.appendChild(dialog);

      dialog.show();

    };
    createDialog();
  `;

  win.webContents.executeJavaScript(cmd);
}

function removeLoadingDialog(win) {
  const cmd = `
    var removeDialog = () => {
      const d = document.getElementById('install-in-progress-dialog');
      if (d) d.remove();
    }
    removeDialog();
  `;

  win.webContents.executeJavaScript(cmd);
}

async function getFlatpakRemotes() {
  return new Promise((resolve, reject) => {
    exec("flatpak remotes | grep flathub", (error, stdout, stderr) => {
      if (error) {
        return reject(`Error executing command: ${stderr}`);
      }

      const lines = stdout.trim().split("\n");

      const options = lines.map((line) => {
        const [_, option] = line.trim().split("\t");
        return option;
      });

      resolve(options);
    });
  });
}

async function getAppInstallType() {
  let remotes = [];

  try {
    remotes = await getFlatpakRemotes();
    console.log("available flathub remotes:", remotes);
  } catch (e) {
    console.error(`error while fetching remotes, ${e}`);
    dialog.showMessageBox({
      title: "Error",
      type: "error",
      message: `No remotes found for Flathub ${e}`,
    });
    return APP_INSTALL_TYPE.Cancel;
  }

  if (!remotes.includes("system") && !remotes.includes("user")) {
    // no available remotes for flathub, prompt error
    dialog.showMessageBox({
      title: "Error",
      type: "error",
      message: `No remotes available for Flathub, please make sure you have flathub configured correctly`,
    });
    return APP_INSTALL_TYPE.Cancel;
  }
  if (remotes.length === 1) {
    const remote = remotes[0];

    switch (remote) {
      case "user":
        return APP_INSTALL_TYPE.User;
      case "system":
        return APP_INSTALL_TYPE.System;
    }
  }
  if (
    remotes.length == 2 &&
    remotes.includes("system") &&
    remotes.includes("user")
  ) {
    let idx = dialog.showMessageBoxSync({
      title: "Select App Install Type",
      message: "Select your App Install Type",
      detail: `System Flatpaks are available to all users on your device.\nUser Flatpaks are installed only available to that user.\n\nIf you are unsure, install the System flatpak`,
      buttons: Object.keys(APP_INSTALL_TYPE),
    });

    return idx;
  }
}

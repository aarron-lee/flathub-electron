const { app, BrowserWindow } = require("electron");
const { dialog } = require("electron");

const { spawn } = require("child_process");

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

async function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);

  await win.loadURL("https://flathub.org/", {});

  win.webContents.on("will-navigate", (event) => {
    const url = new URL(event.url);

    const validOrigins = ["https://dl.flathub.org", "https://flathub.org"];

    if (!validOrigins.includes(url.origin)) {
      event.preventDefault();
    }

    if (
      url.pathname.startsWith("/repo/") &&
      url.host == "dl.flathub.org" &&
      url.pathname.includes(".flatpakref")
    ) {
      const flatpakRef = url.pathname
        .split("/")
        .pop()
        .replace(".flatpakref", "");

      event.preventDefault();

      const idx = dialog.showMessageBoxSync({
        title: "Select App Install Type",
        message: "Select your App Install Type",
        detail: `System Flatpaks are available to all users on your device.\nUser Flatpaks are installed only available to that user.\n\nIf you are unsure, install the System flatpak`,
        buttons: ["Cancel", "User", "System"],
      });

      if (idx === 0) {
        // cancelled, return
        return;
      }

      const terminal = spawn(
        "flatpak",
        [
          "install",
          "flathub",
          idx === 1 ? "--user" : "--system",
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

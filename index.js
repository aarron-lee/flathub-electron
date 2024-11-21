const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");
const { registerTab, TAB_NAMES } = require("./src/navigation");
const removeApps = require("./src/removeApps");
const flathub = require("./src/flathub");
const { createMenu } = require("./src/menu");
const { initializeSettings, IS_WINDOW_HIDDEN } = require("./src/settings");
const { setItem, getItem } = initializeSettings(app);

let win;
let tray;

async function createWindow() {
  const show = !getItem(IS_WINDOW_HIDDEN);
  win = new BrowserWindow({
    minWidth: 800,
    useContentSize: true,
    show,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
  });

  win.webContents.openDevTools();

  createTray();

  tray.on("click", () => {
    const toggleWindow = () => {
      const windowIsVisible = win.isVisible();
      if (windowIsVisible) {
        win.hide();
        setItem(IS_WINDOW_HIDDEN, true);
      } else {
        win.show();
        setItem(IS_WINDOW_HIDDEN, false);
      }
    };
    toggleWindow();
  });

  registerTab(TAB_NAMES.ROOT, win);
  registerTab(TAB_NAMES.REMOVE, removeApps.renderRemoveAppsPage(win));
  registerTab(TAB_NAMES.FLATHUB, flathub.renderFlathub(win, true));
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function createTray() {
  tray = new Tray(path.join(__dirname, "./static/icon.png"));

  const contextMenu = createContextMenu();

  tray?.setToolTip("Flathub");
  tray?.setContextMenu(contextMenu);
}

function createContextMenu() {
  const toggleWindow = () => {
    const windowIsVisible = win.isVisible();
    if (windowIsVisible) {
      win.hide();
      setItem(IS_WINDOW_HIDDEN, true);
    } else {
      win.show();
      setItem(IS_WINDOW_HIDDEN, false);
    }
  };

  const contextMenu = Menu.buildFromTemplate([
    { label: "Toggle Window", click: toggleWindow },
    { label: "Quit", click: () => app.quit() },
  ]);

  return contextMenu;
}

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

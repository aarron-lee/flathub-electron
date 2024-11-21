const { Menu } = require("electron");
const navigation = require("./navigation");

function createMenu() {
  const template = [
    {
      label: "Back",
      //   label: "\u{1F850}",
      click() {
        navigation.navigateTo("FLATHUB");
      },
    },
    {
      label: "Manage Apps",
      click() {
        navigation.navigateTo("REMOVE");
      },
    },
    // {
    //   label: "View",
    //   submenu: [
    //     { role: "reload" },
    //     { role: "forceReload" },
    //     { role: "toggleDevTools" },
    //     { type: "separator" },
    //     { role: "resetZoom" },
    //     { role: "zoomIn" },
    //     { role: "zoomOut" },
    //     { type: "separator" },
    //     { role: "togglefullscreen" },
    //   ],
    // },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };

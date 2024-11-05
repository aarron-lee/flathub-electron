const { Menu } = require("electron");
const navigation = require("./navigation");

function createMenu() {
  const template = [
    {
      label: "Flathub",
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
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };

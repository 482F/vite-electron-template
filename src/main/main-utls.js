import { BrowserWindow, Menu, MenuItem, ipcMain } from 'electron'
import path from 'path'

const utls = {}
utls.isDevelopment = ('' + process.env.NODE_ENV).trim() === 'development'
utls.createWindow = async (options, rawMenuItems, hash) => {
  options.webPreferences ??= {}
  options.webPreferences.preload = path.join(__dirname, 'preload.js')
  const win = new BrowserWindow(options)
  const menuItems = rawMenuItems.map((rawMenuItem) => new MenuItem(rawMenuItem))
  const menu = new Menu()
  menuItems.forEach((menuItem) => menu.append(menuItem))

  win.setMenu(null)
  Menu.setApplicationMenu(menu)

  if (utls.isDevelopment) {
    // Load the url of the dev server if in development mode
    await win.loadURL(`http://localhost:3000/#${hash}`)
  } else {
    // Load the index.html when not in development
    win.loadURL('file://' + __dirname + `/index.html#${hash}`)
  }
  return win
}

utls.listenIpc = (listenerName, eventName, handler) => {
  ipcMain.handle(`${listenerName}-${eventName}`, async (event, args) =>
    JSON.stringify(await handler(event, ...JSON.parse(args)))
  )
}
utls.sendIpc = (win, listenerName, eventName, ...args) => {
  win.webContents.send(`${listenerName}-${eventName}`, JSON.stringify(args))
}

export default utls

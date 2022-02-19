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

const handlers = {}
ipcMain.handle('sendIpc', async (event, json) => {
  const [key, args] = JSON.parse(json)
  const targetHandlers = handlers[key] ?? []
  const results = []
  for (let i = 0; i < targetHandlers.length; i++) {
    results.push(
      await targetHandlers[i](event, ...args).catch(
        () => (targetHandlers[i] = null)
      )
    )
  }
  handlers[key] = targetHandlers.filter(Boolean)
  return JSON.stringify(results)
})

utls.listenIpc = (listenerName, eventName, handler) => {
  handlers[`${listenerName}-${eventName}`] ??= []
  handlers[`${listenerName}-${eventName}`].push(async (...args) =>
    handler(...args)
  )
}
utls.sendIpc = (win, listenerName, eventName, ...args) => {
  if (win.isDestroyed()) {
    throw new Error('window has been destroyed')
  }
  win.webContents.send(`${listenerName}-${eventName}`, JSON.stringify(args))
}

export default utls

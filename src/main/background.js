import { app, BrowserWindow } from 'electron'
import utls from './main-utls.js'
const path = require('path')

async function main() {
  // 二重起動の防止
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
    return
  }

  const appHandlers = {
    'activate': () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    },
    'ready': async () => {
      if (utls.isDevelopment && !process.env.IS_TEST) {
        const installExtension = (await import('electron-devtools-installer'))
          .default
        const VUEJS_DEVTOOLS = (await import('electron-devtools-installer'))
          .VUEJS_DEVTOOLS

        // Install Vue Devtools
        try {
          await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
          console.error('Vue Devtools failed to install:', e.toString())
        }
      }
    },
    'window-all-closed': () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    },
  }
  Object.entries(appHandlers).forEach(([eventName, handler]) =>
    app.on(eventName, handler)
  )

  const Store = require('electron-store')
  const store = new Store({
    cwd: path.dirname(app.getPath('exe')),
    defaults: {
      position: {
        x: 500,
        y: 500,
      },
      size: {
        width: 300,
        height: 300,
      },
      text: 'abc',
    },
  })

  await new Promise((resolve) => app.on('ready', resolve))

  const position = store.get('position')
  const size = store.get('size')
  const options = {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    minWidth: 300,
    minHeight: 300,
    transparent: true,
    frame: false,
    toolbar: false,
    hasShadow: false,
  }
  const menuItems = [
    {
      label: 'devtool',
      submenu: [
        {
          role: 'toggleDevTools',
        },
      ],
    },
  ]

  const ipcHandlers = {
    minimize: ({ sender }) => {
      const win = sender.getOwnerBrowserWindow()
      win.minimize()
    },
    quit: () => app.quit(),
    createWindow: (_, ...args) => utls.createWindow(...args),
    getStore: (_, key) => store.get(key),
    setStore: (_, key, value) => {
      if (value === undefined) {
        store.set(key)
      } else {
        store.set(key, value)
      }
    },
    listen: ({ sender }, listenerName, eventName) => {
      const win = sender.getOwnerBrowserWindow()
      return utls.listenIpc(listenerName, eventName, (_, ...args) => {
        return utls.sendIpc(win, listenerName, eventName, ...args)
      })
    },
  }
  Object.entries(ipcHandlers).forEach(([eventName, handler]) =>
    utls.listenIpc('main', eventName, handler)
  )

  const mainWin = await utls.createWindow(options, menuItems, 'Main')
  mainWin.on('close', () => {
    const position = mainWin.getPosition()
    const size = mainWin.getSize()
    store.set({
      position: {
        x: position[0],
        y: position[1],
      },
      size: {
        width: size[0],
        height: size[1],
      },
    })
  })

  // mainWin に送るのでこれだけ後で app.on する必要がある
  app.on('second-instance', (_, rawArgs) => {
    const args =
      rawArgs?.[0] === 'electron.exe' ? rawArgs.slice(3) : rawArgs.slice(2)
    utls.sendIpc(mainWin, 'main', 'commandline', ...args)
  })

  // Exit cleanly on request from parent process in development mode.
  if (utls.isDevelopment) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit') {
          app.quit()
        }
      })
    } else {
      process.on('SIGTERM', () => {
        app.quit()
      })
    }
  }
}

main()

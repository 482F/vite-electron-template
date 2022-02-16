import { app, BrowserWindow } from 'electron'
import utls from './main-utls.js'

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
    'second-instance': (_, rawArgs) => {
      // Windows 限定・・・
      const args =
        rawArgs?.[0] === 'electron.exe' ? rawArgs.slice(3) : rawArgs.slice(2)
      console.log(args)
    },
  }
  Object.entries(appHandlers).forEach(([eventName, handler]) =>
    app.on(eventName, handler)
  )

  await new Promise((resolve) => app.on('ready', resolve))
  const options = {
    width: 300,
    height: 300,
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
  await utls.createWindow(options, menuItems, 'Main')

  const ipcHandlers = {
    minimize: ({ sender }) => {
      const win = sender.getOwnerBrowserWindow()
      win.minimize()
    },
    quit: () => app.quit(),
    createWindow: (_, ...args) => utls.createWindow(...args),
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

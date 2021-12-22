import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron'
import path from 'path'

console.log(process.argv)

async function main() {
  // 二重起動の防止
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
    return
  }

  const isDevelopment = ('' + process.env.NODE_ENV).trim() === 'development'

  const appHandlers = {
    'activate': () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    },
    'ready': async () => {
      if (isDevelopment && !process.env.IS_TEST) {
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
      const args = rawArgs?.[0] === 'electron.exe' ? rawArgs.slice(3) : rawArgs.slice(2)
      console.log(args)
    },
  }
  Object.entries(appHandlers).forEach(([eventName, handler]) =>
    app.on(eventName, handler)
  )

  await new Promise((resolve) => app.on('ready', resolve))

  const win = new BrowserWindow({
    width: 300,
    height: 300,
    minWidth: 300,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    transparent: true,
    frame: false,
    toolbar: false,
    hasShadow: false,
  })
  const menu = new Menu()
  menu.append(
    new MenuItem({
      label: 'devtool',
      submenu: [
        {
          role: 'toggleDevTools',
          accelarator: 'Ctrl+Shift+I',
        },
      ],
    })
  )
  win.setMenu(null)
  Menu.setApplicationMenu(menu)

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    await win.loadURL('http://localhost:3000/')
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    win.loadURL('file://' + __dirname + '/index.html')
  }

  const ipcHandlers = {
    minimize: () => win.minimize(),
    close: () => app.quit(),
  }
  Object.entries(ipcHandlers).forEach(([eventName, handler]) =>
    ipcMain.handle(eventName, handler)
  )

  // Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
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

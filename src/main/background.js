/*
  IMPORTANT: なぜか一度 yarn build した後に yarn serve しないと失敗する
*/
import { app, BrowserWindow } from 'electron'
import utls from './main-utls.js'
const path = require('path')
const { spawn } = require('child_process')
const wwutilPromise = require('windows-window-util').then((m) => m.default)

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
    },
  })

  await new Promise((resolve) => app.on('ready', resolve))

  const position = store.get('position')
  const size = store.get('size')
  const maximized = store.get('maximized')
  const minimized = store.get('minimized')
  let beforeSize = [size.width, size.height]
  let beforePosition = [position.x, position.y]
  const options = {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    minWidth: 300,
    minHeight: 300,
    transparent: false,
    frame: false,
    toolbar: false,
    hasShadow: false,
    show: false,
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
    reload: ({ sender }) => {
      const win = sender.getOwnerBrowserWindow()
      win.reload()
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
    getAllWindows: async () => {
      const wwutil = await wwutilPromise
      return await wwutil.getAllWindows()
    },
    getFileIcon: (() => {
      const iconMap = {}
      return async (win, targetPath) => {
        iconMap[targetPath] ??= await app.getFileIcon(targetPath)
        const image = await app.getFileIcon(targetPath)
        return image.toDataURL()
      }
    })(),
    changeSuspend: async (win, pid, value) => {
      const args = []
      if (!value) {
        args.push('-r')
      }
      args.push(pid)

      // resume は二回する
      for (let i = 0; i < value ? 1 : 2; i++) {
        await spawn('pssuspend.exe', args)
      }
    },
  }
  Object.entries(ipcHandlers).forEach(([eventName, handler]) =>
    utls.listenIpc('main', eventName, handler)
  )

  const mainWin = await utls.createWindow(options, menuItems, 'Main')
  mainWin.showInactive()
  if (maximized) {
    mainWin.maximize()
  } else if (minimized) {
    mainWin.minimize()
  }

  mainWin.on('resized', () => {
    if (mainWin.isMaximized()) {
      return
    }
    beforeSize = mainWin.getSize()
  })
  mainWin.on('moved', () => {
    if (mainWin.isMaximized()) {
      return
    }
    beforePosition = mainWin.getPosition()
  })
  mainWin.on('close', () => {
    const maximized = mainWin.isMaximized()
    const position = maximized ? beforePosition : mainWin.getPosition()
    const size = maximized ? beforeSize : mainWin.getSize()
    const minimized = mainWin.isMinimized()
    store.set({
      position: {
        x: position[0],
        y: position[1],
      },
      size: {
        width: size[0],
        height: size[1],
      },
      maximized,
      minimized,
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

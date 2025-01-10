import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import path from 'path'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: process.env.NODE_ENV === 'development'
    }
  })

  // 準備好內容後才顯示應用程式視窗
  win.once('ready-to-show', () => {
    win.show()
  })

  // // 非開發環境停用可以打開開發者工具的快捷鍵
  if (process.env.NODE_ENV !== 'development') {
    win.webContents.on('before-input-event', (event, input) => {
      if ((input.control || input.meta) && input.key.toLowerCase() === 'i' ||
          (input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i' ||
          input.key === 'F12') {
        event.preventDefault()
      }
    })
  }

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    // 開發環境時打開應用程式順便打開開發者工具，如果不需要就註解掉
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 添加這個處理來支援 history 模式的路由
  // win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  //   if (errorCode === -6) {
  //     // 路由跳轉失敗時重新導向到 index.html
  //     win.loadFile(path.join(__dirname, '../dist/index.html'))
  //   }
  // })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
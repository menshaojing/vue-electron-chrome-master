'use strict'
import path from 'path'
import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron'

// loading .env
const config = {
  // 应用名字
  APP_NAME: '干部监督大数据智慧平台',
  // 应用地址
  // APP_URL: 'http://11.49.186.46:8080/ecpweb/page/eism/menu/menunav.jsp',
  APP_URL: 'http://11.49.186.46:8080/ecpweb/page/eism/menu/menunav.jsp',
  APP_URL_LIST: [{
    url: 'http://128.196.200.34:8080/ecpweb/page/eism/menu/menunav.jsp',
    label: '干部智慧监督平台-VT'
  }, {
    url: 'http://128.196.119.182:8101/ecpweb/page/eism/menu/menunav.jsp',
    label: '干部智慧监督平台-PL4'
  }],

  // 应用标题
  APP_TITLE: '干部监督大数据智慧平台',

  // 标题栏高度
  // APP_TITLE_BAR_HEIGHT: 30,

  // 标题栏背景色
  // APP_TITLE_BAR_BGCOLOR: '#03a9f4',

  // 标题栏字体颜色
  // APP_TITLE_BAR_TEXTCOLOR: '#fff',

  // 隐藏标题栏
  // APP_TITLE_BAR_HIDE: false,

  // 窗体边框颜色
  // APP_WINDOWN_BORDER_COLOR: '#ECF0F5',

  // 窗体边框css
  // APP_WINDOWN_BORDER: '1px dashed #ccc',

  // 是否显示窗体
  // frame: false,

  // 开启kiosk模式
  // kiosk: false,

  // 开启右键菜单
  contextmenu: true,

  // 开启页面切换加载图标
  didLoading: true,

  // 启用透明模式
  // transparent: flase,

  // 使用窗口大小使用网页尺寸
  useContentSize: true,

  // 是否不开启任务栏图标
  skipTaskbar: false,

  // 跳过缓存开启reloadIgnoringCache()
  ignoringCache: false,

  // 窗口 https://electronjs.org/docs/api/browser-window
  other: {
    resizable: true
    // width: 320,
    // height: 520
  }
}
// console.log(config)
process.env.APP_NAME = config.APP_NAME = config.APP_NAME || 'Electron Browser'
config.APP_TITLE = config.APP_TITLE || ''
config.APP_VERSION = '1.6.0'
config.contextmenu = typeof config.contextmenu === 'undefined' ? true : config.contextmenu

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  // vue
  ? 'http://localhost:9080'
  // ? path.resolve(path.join(__dirname, 'browser-view.html'))
  : `file://${__dirname}/index.html`

const winOptions = {
  ...config.other,
  frame: !!config.frame,
  title: config.APP_NAME,
  kiosk: config.kiosk,
  transparent: config.transparent,
  useContentSize: config.useContentSize,
  skipTaskbar: config.skipTaskbar
}

function createWindow () {
  mainWindow = null
  /**
   * Initial window options
   */
  var options = Object.assign({
    icon: path.join(__dirname, '../renderer/assets/logo.png'),
    // frame: true,
    title: 'Electron Browser',
    // height: 800,
    // useContentSize: true,
    // width: 1000,
    autoHideMenuBar: true,
    // transparent: false,
    // minimizable: true,
    // maximizable: true
    fullscreen: false,
    fullscreenable: true,
    webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: true, // 是否集成 Nodejs
      webSecurity: false,
      webviewTag: true,
      preload: path.join(__dirname, '../public/renderer.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    }
  }, winOptions)

  mainWindow = new BrowserWindow(options)

  mainWindow.loadURL(winURL)
  // BrowserWindow.addExtension('/Users/Administrator/AppData/Local/ChromeCore/User Data/Default/Extensions/egkcjgapmgioadbkhaciondahbjggnhj/1.0.2_0')


  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.on('close', () => {
  console.log('close')
  console.log(mainWindow.isMaximized())
})

ipcMain.on('reload', (opts) => {
  mainWindow.close()
  if (typeof opts === 'object') {
    Object.assign(winOptions, opts)
  }
  createWindow()
})

ipcMain.on('relaunch', () => {
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
  // relaunch不会退出当前应用，需要调用exit或者quit
  app.exit(0)
})

// 设置配置
ipcMain.on('get-config', (event) => {
  // 同步返回
  event.returnValue = config
})
app.commandLine.appendSwitch('--disable-http-cache')
app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

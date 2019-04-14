const electron = require('electron')


const { ipcMain } = require('electron')

// Module to control application life.
const app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 600, height: 800, webPreferences: {nodeIntegration: true}, show: false})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/homepage.html`)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// SETUP
app.setAppUserModelId(process.execPath)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

const learner = require('./learner.js')

var going = true

function loop(arg, event) {
  event.sender.send('transcript', learner.getTranscript())
  console.log("Loop " + going)
  if (!going)
    return

  var promise = learner.askRespond(arg.sourceLang, arg.responseLang)
  promise.then(() => {
    console.log("Here")
    loop(arg, event)
  })
}

// In main process.
app.on('ready', function () {
  console.log('Electron ready')

	ipcMain.on('start', (event, arg) => {
    loop(arg, event)
  })

  ipcMain.on('stop', (event, arg) => {
    going = false
  })

  var storedEvent
  ipcMain.on('get-transcript', (event, arg) => {
    event.returnValue = learner.getTranscript()
  })
})

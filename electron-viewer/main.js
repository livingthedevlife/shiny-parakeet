const { app, BrowserWindow, ipcMain, nativeTheme, dialog  } = require('electron')
const 
    path = require('path'),
    fs = require('fs'),
    dir= require('node-dir')


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
/*     frame:false, */
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
  win.webContents.openDevTools()

  addIpcHandles()
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

function addIpcHandles(){
    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light'
        } else {
            nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system'
    })

    ipcMain.handle('dia:folder', () => {
        return dialog.showOpenDialog({
            title:'Select root directory',
            defaultPath:'G:/livingthedevlife/shiny-parakeet/electron-viewer/',
            properties: ['openDirectory'] 
        })
    })

    ipcMain.handle('evFile:list',(event, folderPath)=>{
        return dir.files(folderPath, {sync:true});
    })
}

function loopFolder(folderPath){
    console.log('loopFolder')
    const 
        contentList=fs.readdirSync(folderPath),
        contents={}

    contentList.forEach((content)=>{
        const contentpath = folderPath + "/" + content

        if (fs.statSync(contentpath).isDirectory()) {
            contents[content]= 'folder'//loopFolder(folderPath)
        }else{
            contents[content]='rawFile'//!parseFile(fs.readFileSync(contentpath))
        }
    });
    return contents
}


function parseFile(rawFile){
    return 'rawFile'
}
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
    ipcMain.handle('evFile:parse',(event, fileList, rootFolderPath)=>{
        const files={}
        fileList.forEach((filepath)=>{
            const path = parsefilepath(rootFolderPath,filepath)

            console.log(path)
            try {
                const data = fs.readFileSync(filepath, 'utf8');
                files[path]=parseFile(data)
              } catch (err) {
                console.error(err);
              }
        })
        return files
        
    })
}


function parsefilepath(rootFolderPath,filepath){
    return filepath.replace(rootFolderPath,'')//.split('\\')

}
function parseFile(rawFile){
    const file={
        state:0,
        title:'',
        tests:{}
    }
    let currentTest=''
    rawFile
        .match(/(?:x?define|x?it|\/\/ARRANGE|\/\/ACT|\/\/ASSERT).*/g)
        .forEach((line)=>{
            if(line.match(/x?define/)){
                file.title= getTitle(line)
            }else if(line.match(/x?it/)){
                currentTest= getTitle(line)
                console.log(currentTest)
                file.tests[currentTest]=[]
            }else{
                length=file.tests[currentTest]
                file.tests[currentTest].push(line)
            }
        })
    return file
}
function getTitle(line){
    return line.match(/\('([^']*)/g).replace('(\'','')
}
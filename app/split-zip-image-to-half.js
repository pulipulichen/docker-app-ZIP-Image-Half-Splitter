const ShellSpawn = require('./lib/ShellSpawn')
const ShellExec = require('./lib/ShellExec')
const GetExistedArgv = require('./lib/GetExistedArgv')

const path = require('path')
const fs = require('fs')

const UnzipFlatten = require('./lib-zip/UnzipFlatten')

const isDirectory = require('./lib/isDirectory')

let main = async function () {
  let files = GetExistedArgv()
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    console.log(file)

    // ----------------------------------------------------------------
    // 如果是資料夾，那就直接做個處理吧


    // ----------------------------------------------------------------

    let commandsUnzip = [
      `rm -rf /cache/*`,
      
      `mkdir -p /cache/img`,
      `mkdir -p /cache/split`,
      // `unzip -j -d "/cache/img" "/cache/${filename}"`
    ]
    for (let j = 0; j < commandsUnzip.length; j++) {
      await ShellExec(commandsUnzip[j])
    }

    let mode
    let filenameNoExt
    if (file.endsWith('.zip')) {
      let filename = path.basename(file)
      filenameNoExt = filename
      if (filenameNoExt.endsWith('.zip')) {
        filenameNoExt = filenameNoExt.slice(0, -4)
      }

      await ShellExec(`cp "${file}" "/cache/${filename}"`)
      
      // ------------------

      await UnzipFlatten(`/cache/${filename}`, `/cache/img`)  
      mode = 'zip'
    } 
    else if (isDirectory(file)) {
      let filename = file
      filenameNoExt = path.basename(file)
      let imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'tif', 'tiff']
      let imagePathPatters = imageTypes.map(type => {
        return `"${filename}"/*.${type}`
      }).join(' ')


      try {
        await ShellExec(`cp -f ${imagePathPatters} /cache/img/`)
      }
      catch (e) {
        // break
      }

      let imgs = fs.readdirSync('/cache/img/')
      if (imgs.length === 0) {
        continue
      }
        
      mode = 'dir'
    }
    else if (file.endsWith('.pdf')) {
      filenameNoExt = path.parse(file).name
      await ShellExec(`pdfimages "${file}" -png "/cache/img/"`)

      mode = 'pdf'
    }
    else if (file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.tif') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.webp')) {
      filenameNoExt = path.parse(file).name
      await ShellExec(`cp "${file}" "/cache/img/"`)

      mode = 'img'
    }
    else {
      continue
    }

    // ----------------
    await splitImagesInCache()

    // await ShellSpawn(`img2pdf -o "/input/${filenameNoExt}.pdf" ${imgs.join(" ")}`)
    if (mode === 'zip') {
      await ShellExec(`cd /cache/img/; zip -r -j "/input/${filenameNoExt}_half.zip" ./*`)
    }
    else if (mode === 'pdf') {
      await ShellExec(`cd /cache/img/; convert *.png "/input/${filenameNoExt}_half.pdf"`)
    } 
    else if (mode === 'dir') {
      await ShellExec(`cd /cache/img/; mkdir -p "/input/${filenameNoExt}_half"; cp -rf * "/input/${filenameNoExt}_half/"`)
    } 
    else if (mode === 'img') {
      await ShellExec(`cd /cache/img/; mkdir -p "/input/${filenameNoExt}_half"; cp -rf * "/input/${filenameNoExt}_half/"`)
    } 
  }
}

let splitImagesInCache = async function () {

    // 列出檔案名稱
    let imgs = fs.readdirSync('/cache/img/')
    
    for (let i = 0; i < imgs.length; i++) {
      let img = imgs[i]

      let sizeCommand = `identify -ping -format '%[width] %[height]' "/cache/img/${img}"`
      // console.log(sizeCommand)

      let sizeString = await ShellExec(sizeCommand)
      let size = sizeString.split(' ')

      if (size[0] > size[1]) {
        // await ShellExec(`rm -rf /cache/split/*`)

        let imgFilename = img
        let ext = imgFilename.slice(imgFilename.lastIndexOf('.') + 1)
        let filenameNoExt = imgFilename.slice(0, imgFilename.lastIndexOf('.'))
        await ShellExec(`mv "/cache/img/${img}" /cache/split`)

        let splitCommand = `convert -crop 50%x100% +repage "/cache/split/${imgFilename}" "/cache/split/${filenameNoExt}_%d.${ext}"`
        // console.log(splitCommand)
        await ShellExec(splitCommand)

        await ShellSpawn([`ls`, '/cache/split/'])

        // 先移動到暫存資料夾
        await ShellExec(`rm -rf "/cache/split/${imgFilename}"`)

        await ShellSpawn([`ls`, '/cache/split/'])
        await ShellExec(`mv /cache/split/* /cache/img/`)
      }
    }
}

main()
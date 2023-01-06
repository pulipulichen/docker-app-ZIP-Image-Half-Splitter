const ShellSpawn = require('./lib/ShellSpawn')
const ShellExec = require('./lib/ShellExec')
const GetExistedArgv = require('./lib/GetExistedArgv')

const path = require('path')
const fs = require('fs')

const UnzipFlatten = require('./lib-zip/UnzipFlatten')

let main = async function () {
  let files = GetExistedArgv()
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    if (file.endsWith('.zip') === false) {
      continue
    }

    let filename = path.basename(file)
    let filenameNoExt = filename
    if (filenameNoExt.endsWith('.zip')) {
      filenameNoExt = filenameNoExt.slice(0, -4)
    }

    let commandsUnzip = [
      `rm -rf /cache/*`,
      `cp "${file}" "/cache/${filename}"`,
      `mkdir -p /cache/img`,
      `mkdir -p /cache/split`,
      // `unzip -j -d "/cache/img" "/cache/${filename}"`
    ]
    for (let j = 0; j < commandsUnzip.length; j++) {
      await ShellExec(commandsUnzip[j])
    }

    // -----------------

    await UnzipFlatten(`/cache/${filename}`, `/cache/img`)

    // ----------------
    await splitImagesInCache()

    // await ShellSpawn(`img2pdf -o "/input/${filenameNoExt}.pdf" ${imgs.join(" ")}`)
    await ShellExec(`zip -r "/input/${filenameNoExt}_half.zip" /cache/img`)
  }
}

let splitImagesInCache = async function () {

    // 列出檔案名稱
    let imgs = fs.readdirSync('/cache/img/')
    
    for (let i = 0; i < imgs.length; i++) {
      let img = imgs[i]

      let sizeCommand = `identify -ping -format '%[width] %[height]' "/cache/img/${img}"`
      let sizeString = await ShellExec(sizeCommand)
      let size = sizeString.split(' ')

      if (size[0] > size[1]) {
        // await ShellExec(`rm -rf /cache/split/*`)

        let imgFilename = img
        let ext = imgFilename.slice(imgFilename.lastIndexOf('.') + 1)
        let filenameNoExt = imgFilename.slice(0, imgFilename.lastIndexOf('.'))
        await ShellExec(`mv "/cache/img/${img}" /cache/split`)

        let splitCommand = `convert -crop 100%x50% +repage "/cache/split/${imgFilename}" "/cache/split/${filenameNoExt}_%d.${ext}"`
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
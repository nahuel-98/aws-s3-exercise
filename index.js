import express from 'express'
import fileUpload from 'express-fileupload'
// import './config.js'
import {uploadFile, listFiles, getFile, downloadFile, getFileURL} from './s3.js'
// import { getSignedUrl } from ("@aws-sdk/s3-request-presigner");

const app = express()
//Middlewares (antes de las rutas)
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
}
)) //lo que hace es colocarle al request una nueva propiedad que puedo ver por consola. useTempFiles es como decirle que quieor que use archivos que se encuntren en alguna de mis carpetas. Directorio de los archivos temporales (temFileDir).

//Routes
app.get('/files', async (req,res) => {
    const result = await listFiles()
    res.json(result.Contents)
})

//me devuelve la Url prefirmada
app.get('/files/:filename', async (req,res) => {
    const {filename} = req.params
    const result = await getFileURL(filename)
    res.json({url: result})
})

app.get('/downloadfile/:filename', async (req,res) => {
    const {filename} = req.params
    await downloadFile(filename)
    res.json({message: "File downloaded"})
})

app.post('/files', async (req,res) => {
    const result = await uploadFile(req.files.file) //Si hacemos console.log de req.files veremos los datos de ese objeto que el cliente envía en su petición para ser cargado.
    res.json({result})
})

app.use(express.static('images')) //me permite poner pública la carpeta "images", para que se acceda a estos recursos desde el navegador. 

app.listen(3000)
console.log(`Server on port ${3000}`)
import {S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand} from '@aws-sdk/client-s3'
//ListObjectsCommand me permite listar los objetos.
import {AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_KEY} from './config.js'
import fs from 'fs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
})
//recibe un 'file', no es un archivo sino que indica dónde puedo encontrar el archivo
export async function uploadFile (file){
    //readStream es para leer un archivo. A medida que leo el archivo, lo voy subiendo
    const stream = fs.ReadStream(file.tempFilePath)
    //PutObjectCommand es una fx que nos da el SDK, es la funcion de subir un archivo.
    const uploadParams =  {
        Bucket: AWS_BUCKET_NAME,
        Key: file.name,
        Body: stream //Es el contenido del archivo. 
    }
    const command = new PutObjectCommand(uploadParams)
    const result = await client.send(command)
    return result;
}

export async function listFiles(){
    //nombre del bucket que queremos listar
    const command = new ListObjectsCommand({
        Bucket: AWS_BUCKET_NAME
    })
    const result = await client.send(command)
    return result
}

export async function getFile(filename){
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    const result = await client.send(command)
    return result;
}

export async function downloadFile(filename){
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    const result = await client.send(command)
    //body es la información del archivo que estamos descargando. Si hacemos console.log() del objeto entero, veremos que tiene una propiedad "Body". Pipe me permite "transmirir " el objeto Body a otro objeto que se va a guardar en nuestro backend, en la carpeta images.
    //WriteStream es flujo de escritura, flujo entre lo que se descarga (canalizando con 'pipe') y lo que se va guardando en la ruta seleccionada. pipe=canalizar
    result.Body.pipe(fs.createWriteStream(`./images/${filename}`))
}
//Me permite obtener la URL prefirmada. 
export async function getFileURL(filename){
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    return await getSignedUrl(client, command, {expiresIn: 3600})
}
import express from 'express'
import cors from 'cors'
import router from './routes/Routes.js'
import bodyParser from 'body-parser';
const app = express()

app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));

import path from 'path';

app.use(express.static(path.resolve('./uploads')));


app.use('/user',router)
app.listen(3001,()=>{
    console.log("serverInnvoked at link http://localhost:3001")
})
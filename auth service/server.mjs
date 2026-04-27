import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/dbconnect.mjs";
import mongoose from "mongoose";
import corsOptions from "./config/corsOptions.mjs";
import cors from "cors";
import cookieParser from "cookie-parser";
import rootRouter from "./routes/root.mjs"
import path from 'path'
// import router1 from "./routes/authRoutes.mjs";
import { fileURLToPath } from "url";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
// console.log(path.join( path.dirname( fileURLToPath(import.meta.url)),'public'))
// console.log(path.join(fileURLToPath(import.meta.url),'public'))
// console.log(import.meta.url)
app.use(cors(corsOptions));
// app.use(cors());
app.use(cookieParser());
app.use(express.json());
let orgPath =fileURLToPath(import.meta.url)
let dirPath = path.join(path.dirname(orgPath),'views','NotFound.html')

app.use('/',express.static(path.join( path.dirname( fileURLToPath(import.meta.url)),'public')))
app.use("/", rootRouter )

app.all(/.*/,(req,res)=>{
  res.status(404)
  if(req.accepts("html")){
    res.sendFile(dirPath);
  }else if(req.accepts("json")){
    res.send({message:"404 Not Found"});
  }else{
    res.type("txt").send("404 Not Found");
  }
})

mongoose.connection.once("open", () => {
  console.log("connected to database");

  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });

});

mongoose.connection.on("error", () => {
  console.log("erre");
});



const express = require("express");
const mongodb = require("mongodb");
const bodyParser = require("body-parser");

if (!process.env.DBHOST) {
    throw new Error("Please specify the databse host using environment variable DBHOST.");
}

if (!process.env.DBNAME) {
    throw new Error("Please specify the name of the database using environment variable DBNAME");
}

const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

function connectDb() {
    return mongodb.MongoClient.connect(DBHOST) 
        .then(client => {
            return client.db(DBNAME);
        });
}

function setupHandlers(app,db){
    const videosCollection = db.collection("videos");

    app.post("/viewed",(req,res)=>{
        const videoPath = req.body.videoPath;

        videosCollection
        .insertOne({videoPath:videoPath})
        .then(()=>{
            console.log(`Added video ${videoPath} to history`);
            res.sendStatus(200);
        })
        .catch(err=>{
            console.error(`Error adding video ${videoPath} to history.`);
            console.error(err && err.stack || err);
            res.sendStatus(500); 
        })
    });
}

function startHttpServer(db){
    return new Promise(resolve =>{
        const app = express();
        setupHandlers(app,db);

        const port = process.env.PORT && parseInt(process.env.PORT)||3000;

        app.listen(port,()=>{
            resolve();
        });
    });
}

function main(){

    return connectDb()                                          
        .then(db => {                                           
            return  startHttpServer(db); 
        });
}

main()
.then(()=>console.log(`History Microservice online on port ${process.env.PORT}`))
.catch(err=>{
    console.error("History Microservice failed to start.");
    console.error(err && err.stack || err);
});
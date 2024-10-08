require('dotenv').config();

const express = require('express');
const http = require("http");
const mongodb = require("mongodb");


const app = express();

if (!process.env.PORT) {
    throw new Error(`Please specify the port number
    for the HTTP server with the environment variable PORT.`);
}

const port = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

function sendViewedMessage(videoPath){
    const postOptions = {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
    };

    const requestBody = {
        videoPath:videoPath,
    };

    const req = http.request(
        "http://history/viewed",
        postOptions,
    )

    req.on("close",()=>{

    });

    req.on("error",(err)=>{
        console.log(err);
    });

    req.write(JSON.stringify(requestBody));
    req.end();
}

// app.get('/',(req,res)=>{
//     res.send("Hello World. Video Streaming Service");
// });

// app.get("/video", (req, res) => {
   

//    try {
//     const forwardRequest = http.request(
//         {
//             host: VIDEO_STORAGE_HOST,
//             port: VIDEO_STORAGE_PORT,
//             path:`/video?path=SampleVideo_1280x720_1mb.mp4`,
//             method:'GET',
//             headers: req.headers,
//         },
//         fowardResponse =>{
//             res.writeHead(fowardResponse.statusCode, fowardResponse.headers);
//             fowardResponse.pipe(res);
//         }
//        );
//         req.pipe(forwardRequest);
//    } catch (error) {
//     // print(error)
//    }
// });

// app.listen(port,()=>{
//     console.log(`Running on localhost:${port}`);
// });

function main(){
    return mongodb.MongoClient.connect(DBHOST)
    .then(client=>{
        const db = client.db(DBNAME);
        const videosCollection = db.collection("videos");

        app.get('/',(req,res)=>{
            res.send("Hello World. Video Streaming Service");
        });

        app.get("/video",(req,res)=>{
            const videoId = new mongodb.ObjectID(req.query.id);

            videosCollection
            .findOne({_id: videoId})
            .then(videoRecord => {
                // if(!videoRecord){
                //     res.sendStatus(404);
                //     return;
                // }

                const forwardRequest = http.request(
                    {
                        host: VIDEO_STORAGE_HOST,
                        port: VIDEO_STORAGE_PORT,
                        path:`/video?path=SampleVideo_1280x720_1mb.mp4`,
                        // path:`/video?path=${videoRecord.videoPath}`,
                        method:'GET',
                        headers: req.headers,
                    },
                    fowardResponse =>{
                        res.writeHead(fowardResponse.statusCode, fowardResponse.headers);
                        fowardResponse.pipe(res);
                    }
                   );
                req.pipe(forwardRequest);
            })
            .catch(err=>{
                console.error("Database query failed.");
                console.error(err && err.stack || err);
                res.sendStatus(500);
            });
        });

        app.listen(port,()=>{
            console.log(`Running on localhost:${port}`);
        });
    });
}

main()
.then(()=> console.log("Video-Streaming Microservice online"))
.catch(err=>{
    console.error("Video-Streaming Microservice failed to start.");
    console.error(err && err.stack || err);
});
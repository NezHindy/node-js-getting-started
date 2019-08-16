const express = require('express');
const path = require('path');
var request = require('request');
const http = require('https');
const fs = require('fs');
const PORT = process.env.PORT || 5000

const app = express();


const tUpload = function(msg){
    console.log("CB WAS CALLED");
    if(msg!=undefined){
    console.error(msg);
    }
}
const downloadFile = function(url,dest,cb){
   request
  .get(url)
  .on('error', function(err) {
    // handle error
  })
  .pipe(fs.createWriteStream(dest));
}


app
.get('/:fileName',function(req,res){
    //send the file to download
    res.sendFile(__dirname+"/"+req.params.fileName);
});

app
    .get('/youtube/:vidId',
         function(req,res){
    console.log("SUCCESS. Video:"+req.params.vidId);
    request.get("https://salafi.herokuapp.com/api/info?url=https://www.youtube.com/watch?v=" + req.params.vidId + "&format=bestaudio",function(error,response,body){
        if(!error && response.statusCode==200){
            //console.log(body);
            var jsonRes = JSON.parse(body);
           // console.log("PARSED URL:"+jsonRes.info.url);
            var fileName = jsonRes.info.title;
            fileName = fileName.replace(/ /g,"_");
            fileName = fileName+"."+jsonRes.info.ext;
            fileName = __dirname+"/"+fileName;
            console.log("full file name:"+fileName);
            downloadFile(jsonRes.info.url,fileName,tUpload);
        }
    })
    res.end();
});

    

/*app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))*/


//start server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

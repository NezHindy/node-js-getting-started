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
    console.log("starting download to "+dest+"\n \n URL:"+url);
    var file = fs.createWriteStream(dest);
  var requ = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
        console.log("reached finished");
      file.end(cb);  // close() is async, call cb after close completes.
    });
      // check for request error too
    requ.on('error', (err) => {
        fs.unlink(dest);
        return cb(err.message);
    });

    file.on('error', (err) => { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result) 
        return cb(err.message);
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

  
/*const getVideo = (request,response) =>{
    var urls = request.url; 
    
    //get youtube id and make request to youtube-dl http and get json
    console.log(urls.pathname);
    //request("https://salafi.herokuapp.com/api/info?url=https://www.youtube.com/watch?v=" + _ytlink + "&format=bestaudio")
    //download the best-audio format from json to local folder
    //send the downloaded audio to telegram chat

}*/

app
    .get('/youtube/:vidId',
         function(req,res){
    console.log("SUCCESS. Video:"+req.params.vidId);
    request.get("https://salafi.herokuapp.com/api/info?url=https://www.youtube.com/watch?v=" + req.params.vidId + "&format=bestaudio",function(error,response,body){
        if(!error && response.statusCode==200){
            console.log(body);
            var jsonRes = JSON.parse(body);
            console.log("PARSED URL:"+jsonRes.info.url);
            var fileName = jsonRes.info.title;
            fileName = fileName.replace(/ /g,"_");
            fileName = fileName+"."+jsonRes.info.ext;
            fileName = __dirname+"/audio/"+fileName;
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

const express = require('express');
const path = require('path');
var request = require('request');
const http = require('https');
const fs = require('fs');
const Telegraf = require('telegraf');
const Telegram = require('telegraf/telegram');
const PORT = process.env.PORT || 5000
var _nameOfFile="";
const app = express();
var BOT_TOKEN='452553647:AAGGiKN-rsQrORgJNdNL63lDDQ549aFKFo0';
var FAWZAN_CHATID='@shalfawzan';
var ADMIN_CHATID='@NezamUddin';
var _vidId = "";
var files = [];

var ffmpeg = require('fluent-ffmpeg');

function getFileSizeInKb(filename){

    var stats = fs.statSync(filename);
    return stats/1024;
}
function deleteFiles(callback){
  var i = files.length;
  files.forEach(function(filepath){
    fs.unlink(filepath, function(err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
}

/**
 *    input - string, path of input file
 *    output - string, path of output file
 *    callback - function, node-style callback fn (error, result)        
 */
function convert(input, output, callback) {
 
    
    ffmpeg(input)
        //.output(output)
        .noVideo()
        //.format('mp3')
        //.videoCodec('libx264')
        //.audioCodec('libmp3lame')
        //.outputOptions('-ab','192k')
        .on('progress', function(progress) {                    
            console.log('progressing..'+progress.percent+'% done');
        })
        .on('end', function() {                    
            console.log('conversion ended');
            callback(null);
        }).on('error', function(err){
            console.log('error: '+err);
            callback(err);
        }).save(output);//pipe(audio,{end:false});//run();*/
    
}
const fetchLink = function(mode)
{
        var link = "https://salafi.herokuapp.com/api/info?url=https://www.youtube.com/watch?v=" + _vidId + "&format=";
        if(mode=="video")
            link+="mp4";
        else
            link+="bestaudio";
        console.log('now downloading'+_vidId+' in '+mode+' mode');
        request.get(link,function(error,response,body){
        if(!error && response.statusCode==200){
            //console.log(body);
            var jsonRes = JSON.parse(body);
           // console.log("PARSED URL:"+jsonRes.info.url);
            var fileName = jsonRes.info.title;
            //fileName = fileName.replace(/ /g,"_");
            fileName = _vidId+"."+jsonRes.info.ext;
            _nameOfFile = fileName;
            fileName = __dirname+"/"+fileName;
            console.log("full file name:"+fileName);
            console.log("nameOfFile:"+_nameOfFile);
            downloadFile(jsonRes.info.url,fileName,jsonRes,mode);
            console.log('fetchlink finished with download..');
        }else
            console.log(error);
    })
}

const botWork = function(dest,jsonResponse,mode){
const bot = new Telegraf(BOT_TOKEN)
bot.launch();
    const extra = {
    ...jsonResponse.info.title && { title: jsonResponse.info.title },
          
              ...jsonResponse.info.duration && { duration: jsonResponse.info.duration },
              ...jsonResponse.info.creator && { performer: jsonResponse.info.creator },
              ...jsonResponse.info.duration && { caption: '@shalfawzan' },
};
    bot.telegram.sendAudio(FAWZAN_CHATID,{ source: dest },extra).then(function(){
    deleteFiles(function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('all files removed');
  }
});
    });
    if(jsonResponse.info.description!=null && jsonResponse.info.description!=undefined)
    bot.telegram.sendMessage(FAWZAN_CHATID,jsonResponse.info.description);
    

}


const downloadFile = function(url,dest,jsonResponse,mode){
   request
  .get(url,function(error,response,body){
        if(!error && response.statusCode==200){
           var len = parseInt(response.headers['content-length'],10);
            var cur = 0;
            var total = len/1048576;
            response.on('data',function(chunk)
                        {cur+=chunk.length;console.log('downloading '+ (100.0*cur/len).toFixed(2)+'% ' + (cur/1048576).toFixed(2) + ' MB\r Total Size: '+total.toFixed(2)+ 'MB');});
        }
        else
            console.log(error);}
    )
  .on('error', function(err) {
    // handle error
      console.log(err);
  })
  .pipe(fs.createWriteStream(dest))
   .on('finish',function(args){
       console.log('enterred on finish');
       files.push(dest);
       //check size of the written file
       if(mode=="video")
       {
           //rip the audio out of video
           console.log('converting video..');
          
           convert(dest, __dirname+'/'+_vidId+'.mp3', function(err){
                   if(!err) {
                       files.push(__dirname+'/'+_vidId+'.mp3');
                       console.log('conversion complete..uploading in 5..');
                       
                       //send to bot now
                        botWork(__dirname+'/'+_vidId+'.mp3',jsonResponse,mode);
                   }
                });
       }else{
         // check file size to be <200 kb
           if(getFileSizeInKb(dest)<200)
           {
               //fire fetch for video
               fetchLink('video');
           }
           else
            botWork(dest,jsonResponse,mode);}
   });
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
    _vidId = req.params.vidId;
    fetchLink('video');
     /*convert('./fUgrwcF78Qc.mp4','./teste.mp3', function(err){
                   if(!err) {
                       console.log('conversion complete');
                       //...

                   }
                });*/
    res.end();
});




//start server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

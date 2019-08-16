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


const botWork = function(dest,jsonResponse){
const bot = new Telegraf(BOT_TOKEN)
bot.launch();
    const extra = {
    ...jsonResponse.info.title && { title: jsonResponse.info.title },
          
              ...jsonResponse.info.duration && { duration: jsonResponse.info.duration },
              ...jsonResponse.info.creator && { performer: jsonResponse.info.creator },
              ...jsonResponse.info.description && { caption: '@shalfawzan' },
};
    bot.telegram.sendAudio(FAWZAN_CHATID,{ source: dest },extra);
    if(jsonResponse.info.description!=null && jsonResponse.info.description!=undefined)
    bot.telegram.sendMessage(FAWZAN_CHATID,jsonResponse.info.description);
    //delete from server
    fs.unlink(dest, (err) => {
  if (err) {
    console.error(err)
    return
  }});

}


const downloadFile = function(url,dest,jsonResponse){
   request
  .get(url)
  .on('error', function(err) {
    // handle error
  })
  .pipe(fs.createWriteStream(dest))
   .on('finish',function(args){
       console.log('enterred on finish');
      botWork(dest,jsonResponse);
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
    request.get("https://salafi.herokuapp.com/api/info?url=https://www.youtube.com/watch?v=" + req.params.vidId + "&format=bestaudio",function(error,response,body){
        if(!error && response.statusCode==200){
            //console.log(body);
            var jsonRes = JSON.parse(body);
           // console.log("PARSED URL:"+jsonRes.info.url);
            var fileName = jsonRes.info.title;
            fileName = fileName.replace(/ /g,"_");
            fileName = fileName+"."+jsonRes.info.ext;
            nameOfFile = fileName;
            fileName = __dirname+"/"+fileName;
            console.log("full file name:"+fileName);
            downloadFile(jsonRes.info.url,fileName,jsonRes);
        }
    })
    res.end();
});




//start server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

'use strict';

const Audio = require('audio');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const _ = require('./underscore-min.js');
var router = express.Router();
var app = express();
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const HOST = path.join(__dirname, 'host.html');
var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();
const { exec } = require('child_process');
// downloadVideoAndPlay();
var users = [];
express().use(express.static('public'));

app.use('/', express.static(__dirname + '/'));
const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))

// router.get('/host', function(req, res) {
//     res.sendFile(HOST);});
const io = socketIO(server);

var host;
var players = [];
var roomcode = 0;
var roomcode = 0;
var nextIndex = 0;
io.on('connection', (socket) => {
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });
    users.push([socket.id, ""]);
    socket.on('i am client', console.log);
    socket.on('i am host',() =>
    { host = socket;
        socket.on('disconnectPlayer', (index) => {players[index].disconnect();
        })
        roomcode = Math.floor(Math.random()*10000);
        socket.emit('roomcreated', {
            message: roomcode, 
            id: socket.id
        });
    });
    socket.on('joinRoom', (data) =>{
        console.log("room code: " + roomcode + "\n code provided: " + data.room)
        if(data.room == (roomcode+"")){
            console.log("adding player");
        io.emit('newPlayer', {name: data.name, index: nextIndex});
        nextIndex++;
        players.push(socket);
        socket.emit("joinedRoom", "success");
        }
        else{
            socket.emit("badRoomCode", "bad room code");
        }
    })
    socket.on('getAudio', (data) => {
        downloadVideoAndPlay(data.url);
    })
    socket.on('sendData', (data) => {
        dataSent(data);
})});

function downloadVideoAndPlay(url){
    const fs = require('fs');
const ytdl = require('ytdl-core');
ytdl(url).pipe(fs.createWriteStream('video.flv'));
setTimeout(() => {
    command = ffmpeg('video.flv').format('mp3').saveToFile('audiotest.mp3');
    setTimeout(()=>{(exec('sox -V audiotest.mp3 editedaudio.mp3 reverse', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }
        io.emit("newAudio", "newAudio.")
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      }))},2000);
  }, 3000);
  

}

    // Audio.load('./audio.mp3').then(audio =>{
    //     audio
    //       .reverse()
    //       .save('sample-edited.mp3');
    //       console.log('after');
    // });

// fs.unlink('audio.mp3')


function dataSent(data){
    console.log(data.data.substring(0,4));
    if(data.data.substring(0,4) == "name"){
        console.log("new name for Id: " + data.data.substring(5));
        findId(data.id, (index) =>{
            let oldname = false;
            let oldstring = "";
            if(users[index][1] !== ""){
                oldname = true;
                oldstring = users[index][1];
            }
            users[index][1] = _.escape(data.data.substring(5));
            console.log("Name set");
            if(oldname){
            io.emit('updateChatServer', "<i>" + oldstring + " changed their name to " + _.escape(data.data.substring(5)) + "</o><br>" );
            }
            else{
                io.emit('updateChatServer', "<b>Welcome " + _.escape(data.data.substring(5)) + " to the chatroom!</b><br>")
            }
        })
    }
    else if(data.data.substring(0,4) == "chat"){    
        findId(data.id, (index) =>{
            io.emit('updateChat',users[index][1]+ ": " + _.escape(data.data.substring(5)) + "<br>");

        })
    }
    console.log("Data complete");
}

function findId(id, _callback){
    for(let i = 0; i < users.length; i++){
        if(users[i][0] == id){
            _callback(i);
            return;
        }
    }
    _callback(-1);
    return;
}


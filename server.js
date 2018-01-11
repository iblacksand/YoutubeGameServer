'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

var users = [];

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });
    users.push([socket.id, ""]);
    socket.on('i am client', console.log);
    socket.on('sendData', (data) => dataSent(data));
});

function dataSent(data){
    console.log(data.data.substring(0,4));
    if(data.data.substring(0,4) == "name"){
        console.log("new name for Id: " + data.data.substring(5));
        findId(data.id, (index) =>{
            users[index][1] = data.data.substring(5);
            console.log("Name set");

        })
    }
    else if(data.data.substring(0,4) == "chat"){
        console.log("new name for Id: " + data.data.substring(5));
        findId(data.id, (index) =>{
            io.emit('updateChat', users[index][1]+ ": " + data.data.substring(5) + "<br>");

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


// setInterval(() => io.emit('time', new Date().toTimeString()), 10000);
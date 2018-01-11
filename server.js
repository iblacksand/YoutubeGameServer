'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const _ = require('./underscore-min.js');

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
            let oldname = false;
            let oldstring = "";
            if(users[index][1] !== ""){
                oldname = true;
                oldstring = users[index][1];
            }
            users[index][1] = _.escape(data.data.substring(5));
            console.log("Name set");
            if(oldname){
            io.emit('updateChatServer', "<i>" + oldstring + " change their name to " + _.escape(data.data.substring(5)) + "</o><br>" );
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

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

// setInterval(() => io.emit('time', new Date().toTimeString()), 10000);
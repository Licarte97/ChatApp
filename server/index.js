const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
var request = require('request');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(express.json());
app.use(router);

const uri = "mongodb+srv://root:root@james-cluster1.mryuu.mongodb.net/chatapp?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const usersRouter = require('./routes/users.route');
const chatsRouter = require('./routes/chats.route');
const { json } = require('express');

app.use('/users', usersRouter);
app.use('/chats', chatsRouter);

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    //get all chat
    const request = require('request');
    request('http://localhost:5000/chats', function (error, response, body) {
      console.error('error:', error); // Print the error if one occurred
      history = JSON.parse(body);
      history.forEach(chat => {socket.emit('message', { user: chat.username, text: chat.chat})});
    });
    
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });
    
    //send a post request
    request.post({ headers: {'content-type' : 'application/json'}
               , url: 'http://localhost:5000/chats', body: JSON.stringify({ username: user.name, room: user.room, chat: message})}
               , function(error, response, body){
      console.log(body); 
    }); 

    console.log(history);
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    
    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));
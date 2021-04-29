import {Category, Challenge, CTF} from './models';

/*
* WEBSOCKET
*/
const webSocketsServerPort = 8345;
const webSocketServer = require('websocket').server;
const http = require('http');

// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server
});

// Generates unique ID for every new connection
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

// I'm maintaining all active connections in this object
const clients = {};
// I'm maintaining all active users in this object
const users = {};

const sendMessage = (json) => {
  // We are sending the current data to all connected clients
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
  });
}

const typesDef = {
  USER_EVENT: "userevent",
}

wsServer.on('request', function(request) {
  var userID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const dataFromClient = JSON.parse(message.utf8Data);
      const json = { type: dataFromClient.type };
      if (dataFromClient.type === typesDef.USER_EVENT) {
        users[userID] = dataFromClient;
        json.data = { users };
      }
      sendMessage(JSON.stringify(json));
    }
  });
  // user disconnected
  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    const json = { type: typesDef.USER_EVENT };
    json.data = { users };
    delete clients[userID];
    delete users[userID];
    sendMessage(JSON.stringify(json));
  });
});

/*
* EXPRESS
*/ 
const express = require('express')
const app = express();
const expressPort = 9999

app.listen(expressPort, () => {
  console.log(`Server listening at http://localhost:${expressPort}`);
});

app.get('/ctfs', (req, res) => {
  res.send({...CTF.getAll()});
});
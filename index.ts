import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {Category, Challenge, CTF} from './models/index';
import { resolve } from 'node:path';
import { rejects } from 'assert/strict';

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
interface User {
  id: string;
  username: string;
}
const users:User[] = [];

const sendMessage = (json) => {
  // We are sending the current data to all connected clients
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
  });
}

enum wsTypes {
  USER_EVENT = "userevent",
}

interface wsResult{
  type: wsTypes;
  data: any;
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
      const json: wsResult = { type: dataFromClient.type, data: null };
      if (dataFromClient.type === wsTypes.USER_EVENT) {
        users.push({id: userID, username: dataFromClient.username});
        json.data = users;
      }
      sendMessage(JSON.stringify(json));
    }
  });
  // user disconnected
  connection.on('close', function(connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    const json = { type: wsTypes.USER_EVENT, data: users };
    delete clients[userID];
    users.splice(users.findIndex(u => u.id === userID),1);
    sendMessage(JSON.stringify(json));
  });
});

/*
* EXPRESS
*/ 
const app = express();
const expressPort = 9999

app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen(expressPort, () => {
  console.log(`Server listening at http://localhost:${expressPort}`);
});

app.route('/ctf')
  .get((req, res) => {
    const id = parseInt(req.query.id.toString(), 10);
    CTF.get(id)
      .then(ctf => {
        res.send(ctf);
      })
      .catch(err => res.send(err));
  })
  .post((req, res) => {
    CTF.create(req.body.name, req.body.start, req.body.end, req.body.url).then(_ => res.send(true)).catch(_ => res.send(false));
  })
  .put((req, res) => {
    const ctf: CTF = Object.setPrototypeOf(req.body, CTF.prototype);
    ctf.update().then(_ => res.send(true)).catch(err => res.send(err));
  })
  .delete((req, res) => {
    const id = parseInt(req.query.id.toString(), 10);
    CTF.delete(id).then(_ => res.send(true)).catch(err => res.send(err));
  });

app.get('/ctfs', (req, res) => {
  CTF.getAll()
    .then(ctfs => {
      res.send(ctfs);
    })
    .catch(err => {
      res.statusCode = 500;
      res.send(err);
    })
});
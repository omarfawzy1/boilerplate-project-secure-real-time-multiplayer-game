  
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet')
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(helmet.noCache())
app.use(helmet.noSniff())
app.use(helmet.hidePoweredBy())
app.use(helmet.xssFilter())



app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});


const io = socket(server)
let playersCount = 0;
let players = {};
let playersId = 0;
let collectableId = 0;
let colletables = {0: generateCollectable()};
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // max & min both included 
}

function generateCollectable(){
  let x = getRandomIntInclusive(20, 620)
  let y = getRandomIntInclusive(80, 380)
  let colletable =  {x: x, y: y, value: getRandomIntInclusive(10, 100), id: collectableId};
  collectableId += 1; 
  return colletable
}


io.on("connection", (socket) => {
  let id = playersId;
  playersId += 1;
  console.log(`player with id ${id}`)
  socket.emit("start",{givenId:id})
  
  let player = {x: 200, y: 200, score: 0, id: id};
  players[id] = player;
  
  update()

  socket.on('player movement', ({x, y}) => {
    players[id].x = x;
    players[id].y = y;
    update()
  })

  socket.on('player score', ({cid}) => {
    console.log("Player SOCRED")
    players[id].score += colletables[cid].value
    delete colletables[cid]
    console.log(`player ${id} scores`)
    c = generateCollectable()
    colletables[c.id] = c 
    update()
    io.emit("score")
  })


  socket.on('disconnect', () => {
    delete players[id]
    console.log(`player ${id} disconnected`);
    update()
  });

  function update(){
    io.emit("update", {newPlayers: players, newCollectibles: colletables})
  }

});
module.exports = app; // For testing

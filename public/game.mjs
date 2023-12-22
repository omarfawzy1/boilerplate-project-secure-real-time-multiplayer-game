import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
//@ts-check
const socket = io();
const canvas = document.getElementById('game-window');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

let width = 640
let height = 480



var rank = 1;
var score = 0;
let players = {}
var playersCount = 0
let collectibles = {}
let id = 0;
clearContext()

socket.on("start", ({givenId}) => {
    id = givenId 
})

socket.on("update", ({newPlayers, newCollectibles}) => {
    players = newPlayers;
    collectibles = newCollectibles;
    renderPlayers()
})

socket.on("score", () => {
    let player = new Player(players[id])
    let otherPlayers = []

    for(let k in players){
        if(k == id)
            continue
        otherPlayers.push(new Player(players[k]))
    }

    rank = player.calculateRank(otherPlayers)
    score = player.score
})

function clearContext(){
    ctx.clearRect(0,0,width, height);
    ctx.beginPath()
    ctx.fillStyle = 'black';
    ctx.rect(0, 0, width, height)
    ctx.fill();
    ctx.closePath();

    ctx.beginPath()
    ctx.fillStyle = 'white';
    ctx.rect(0, 70, width, 5)
    ctx.rect(width/2, 0, 5, 70)
    ctx.rect(0, 420, width, 5)
    ctx.rect(390, 420, 5, 60)
    ctx.font = "32px Inter";
    ctx.textAlign = "center";
    ctx.fillText("SCORE", 50 + 55, 45)
    ctx.fillText(score, 120 + 50 + 55, 45)
    ctx.fillText("Rank", 460 , 462)
    ctx.fillText(`${rank}/${playersCount}`,460 + 100, 462)
    ctx.fill();
    ctx.closePath();
}

function renderPlayers(){
    clearContext()
    playersCount = 0;
    for(let id in players){
        playersCount++;
        let player = players[id]
        let pImage = new Image();
        pImage.src = `/public/res/players/mouse${player.id % 2}.png`;
        pImage.onload = () => ctx.drawImage(pImage, player.x, player.y, 55, 55)
    }
    renderCollectablies()
}

function renderCollectablies(){
    for(let cid in collectibles){
        let collectable = new Collectible(collectibles[cid])
        let cImage = new Image();
        cImage.src = `/public/res/collectables/ch-${collectable.id % 7}.png`;
        cImage.onload = () => ctx.drawImage(cImage, collectable.x, collectable.y, 55, 55)
    }
}

window.addEventListener("keydown", onKeydown)
let controls = {
    "w":"up", 
    "s":"down",
    "d":"right",
    "a":"left"
}

function onKeydown(e){
    let direction = controls[e.key]
    if(direction){
        /** @type {Player} */
        let player = new Player(players[id])
        player.movePlayer(direction, 5);
        socket.emit("player movement", {x:player.x, y:player.y})
        
        for(let c in collectibles){
            let collectable = new Collectible(collectibles[c]);
            
            if(player.collision(collectable)){
                
                socket.emit("player score", {cid: collectable.id})
            }
        }
    }
}



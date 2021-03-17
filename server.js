var express = require("express");
var socket = require("socket.io");


//Express setup
var app = express();
var server = app.listen(3000, function() {
    console.log("Server is running!");
});


app.use(express.static("public"));

//Socket setup
var io = socket(server);

var players = [];
var rooms = [];

io.on("connection", function(socket) {
    var roomId;

    socket.on("clientConnect", function (data) {        
        if (data.room != "") {
            var foundRoom = false; 
            roomId = data.room;

            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].id == data.room) {
                    //Caso encontre a room especificada
                    foundRoom = true;
                }
            }

            if (!foundRoom) {
                rooms.push(createRoom(data.room));
            }

        } else {
            if (rooms.length == 0) {
                //Caso seja a primeira room criada - Cria a primeira
                roomId = Math.floor(Math.random() * 10000).toString();
                rooms.push(createRoom(roomId));
                
            } else {
                //Caso já existam rooms abertas
                var foundEmptySlot = false; 

                for (var i = 0; i < rooms.length; i++) {
                    if (rooms[i].players.length < 3) {
                        //Caso ainda haja espaço nesta room, coloca o jogador na mesma
                        roomId = rooms[i].id;
                        foundEmptySlot = true;
                    }
                }

                if(!foundEmptySlot) {
                    //Caso não encontre uma sala com espaço, cria-se uma nova
                    roomId = Math.floor(Math.random() * 10000).toString();
                    rooms.push(createRoom(roomId));
                }
            }
        }

        var playerData = {
            "name":data.name,
            "id":socket.id,
            "room":roomId,
            "position": data.position,
            "radius": data.radius
        };

        rooms.find(room => room.id == roomId).players.push(playerData);

        socket.join(roomId);
        socket.emit("setId", roomId, socket.id);
    
        console.log(rooms);

    });

    socket.on("disconnect", function () {
        if (rooms.length > 0) {
            for (var i = 0; i < rooms.find(room => room.id == roomId).players.length; i++) {
                if (rooms.find(room => room.id == roomId).players[i].id == socket.id) {
                    rooms.find(room => room.id == roomId).players = rooms.find(room => room.id == roomId).players.filter(player => player.id != socket.id);
                }
            }
        }
            
        if(rooms.find(room => room.id == roomId).players.length == 0) {
            rooms = rooms.filter(room => room.id != roomId);
        }
        // console.log(rooms);
    });

    socket.on("sendPlayerInfo", function (playerInfo) {
        if (rooms.find(room => room.id == roomId).players.find(player => player.id == socket.id)) {
            rooms.find(room => room.id == roomId).players.find(player => player.id == socket.id).position = playerInfo.position;
            rooms.find(room => room.id == roomId).players.find(player => player.id == socket.id).radius = playerInfo.radius;
        
            var playerX = playerInfo.position.x;
            var playerY = playerInfo.position.y;

            //Calcular a distância entre o jogador que emitiu o socket e os orbs
            rooms.find(room => room.id == roomId).orbs.forEach(orb => {
                if(Math.sqrt(Math.pow(orb.position.x - playerX, 2) + Math.pow(orb.position.y - playerY, 2)) < playerInfo.radius / 2) {
                    rooms.find(room => room.id == roomId).orbs = rooms.find(room => room.id == roomId).orbs.filter(thisOrb => thisOrb.id != orb.id);
                    rooms.find(room => room.id == roomId).orbs = [...rooms.find(room => room.id == roomId).orbs, ...createOrbs(1)];
                    rooms.find(room => room.id == roomId).players.find(player => player.id == socket.id).radius = Math.sqrt((Math.PI * Math.pow(playerInfo.radius, 2) + (Math.PI * Math.pow(orb.radius, 2))) / Math.PI);
                }
            });

            //Calcular a distância entre o jogador que emitiu o socket e os outros
            rooms.find(room => room.id == roomId).players.forEach(otherPlayer => {
                if(otherPlayer.id != socket.id) {
                    if(Math.sqrt(Math.pow(playerX - otherPlayer.position.x, 2) + Math.pow(playerY - otherPlayer.position.y, 2)) < otherPlayer.radius / 2) {
                        // if(getDistance(otherPlayer.position.x, playerX, otherPlayer.position.y, playerY) < otherPlayer.radius / 2) {
                        if(playerInfo.radius > otherPlayer.radius) {
                            //Orb maior absorve o menor
                            rooms.find(room => room.id == roomId).players.find(player => player.id == socket.id).radius = Math.sqrt((Math.PI * Math.pow(playerInfo.radius, 2) + (Math.PI * Math.pow(otherPlayer.radius, 2))) / Math.PI);
                            rooms.find(room => room.id == roomId).players = rooms.find(room => room.id == roomId).players.filter(thisPlayer => thisPlayer.id != otherPlayer.id);
                            socket.to(otherPlayer.id).emit("restartGame");
                        }
                    }
                }
            });
            
        }
    });

});

//Functions

function getDistance (x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function createOrbs(amount) {
    var orbs = [];
    for (var i = 0; i < amount; i++) {
        var orbRadius = Math.floor(Math.random() * (10, 15) + 10);
        do {
            var randX = Math.floor((Math.round(Math.random()) * 2 - 1) * Math.random() * 1000);
            var randY = Math.floor((Math.round(Math.random()) * 2 - 1) * Math.random() * 1000);
        } while (Math.sqrt(Math.pow(0 - randX, 2) + Math.pow(0 - randY, 2)) > 1000 - orbRadius);


        var colors = [{"r": 255, "g": 120, "b": 120}, {"r": 120, "g": 255, "b": 120}, {"r": 120, "g": 120, "b": 255}, {"r": 255, "g": 255, "b": 120}, {"r": 255, "g": 120, "b": 255}, {"r": 120, "g": 255, "b": 255}];
        let orb = {"id": Math.floor(Math.random() * 999999), "position": {"x": randX, "y": randY}, "radius": orbRadius, "color": colors[Math.floor(Math.random() * colors.length)]};
        orbs.push(orb);
    }

    return orbs;
}

function createRoom(id) {
    var roomData = {                
        "id": id,
        "players": [],
        "orbs": createOrbs(100)
    }

    return roomData;
}

setInterval(function() {
    rooms.forEach(room => {
        io.to(room.id).emit("sendAllClientsPositions", JSON.stringify(room.players), JSON.stringify(room.orbs));
    });
}, 35);
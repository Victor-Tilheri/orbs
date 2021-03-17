var canvas;
var scaleFactor;

function setup () {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style("z-index", "-1");
    canvas.style("display", "none");
    background(150);
}

function draw () {
    if (player != null) {
        scaleFactor = (player.radius / 128);
        player.move();
        sendMovementInfo();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

//Send to server the local player position
function sendMovementInfo() {
    let data = {
        "name": name,
        "position":player.position,
        "radius":player.radius
    }
    socket.emit("sendPlayerInfo", data);
}

function drawOrbs(orbsData) {
    let orbs = JSON.parse(orbsData);
    for (let i = 0; i < orbs.length; i++) {
        push();
        fill(color(orbs[i].color.r, orbs[i].color.g, orbs[i].color.b));
        ellipse(orbs[i].position.x / scaleFactor, orbs[i].position.y / scaleFactor, orbs[i].radius / scaleFactor, orbs[i].radius / scaleFactor);
        pop();
    }
}

socket.on("sendAllClientsPositions", function (playersInfo, orbsData) {
    if (player != null) {
        let players = JSON.parse(playersInfo);
        translate((width/2) - player.position.x / scaleFactor, (height/2) - player.position.y / scaleFactor);
        background(20);
        push();
        fill(51);
        //Draw arena
        ellipse(0, 0, 2000 / scaleFactor, 2000 / scaleFactor);
        pop();
        drawOrbs(orbsData);
        for (let i = 0; i < players.length; i++) {
            if (players[i].id != playerId) {
                push();
                let otherFactor = (players[i]. radius / 128);
                let enemyRadius = (players[i].radius / scaleFactor);
                ellipse(players[i].position.x / scaleFactor, players[i].position.y / scaleFactor, enemyRadius, enemyRadius);
                textSize(24 * otherFactor);
                text(players[i].name, (players[i].position.x - (players[i].name.length / 2) * 10.5 * otherFactor) / scaleFactor, (players[i].position.y + 6 * otherFactor) / scaleFactor);
                pop();
            } else {
                player.radius = players[i].radius;
                noStroke();
                ellipse(players[i].position.x / scaleFactor, players[i].position.y / scaleFactor, 128, 128);
                textSize(24);
                text(players[i].name, (players[i].position.x / scaleFactor - (players[i].name.length / 2) * 10.5), players[i].position.y / scaleFactor + 6);    
            }
        }
    }
});
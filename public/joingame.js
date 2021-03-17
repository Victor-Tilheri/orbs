const socket = io.connect("http://26.119.169.40:3000");
let player;
let room;
let playerName;
let playerId;
let isPlaying = false;

$(document).ready(function() {
	$(document).on('submit', '#joinForm', function() {
        if (document.getElementById("nameInpt").value != "") {
            document.getElementById("logo").style.display = "none";
            canvas.style("display", "block");
            document.getElementById("roomIdBox").style.display = "block";
            

            playerName = document.getElementById("nameInpt").value;
            room = document.getElementById("roomIdInpt").value;

            let data = {
                "name":playerName,
                "room":room,
                "position": {"x": 0, "y": 0},
                "radius": 128
            }
            player = new Player(name, 0, 0, 128);
            isPlaying = true;
            socket.emit("clientConnect", data);

        }
	  return false;
	 });
});

socket.on("setId", function (roomId, id) {
    document.getElementById("roomIdTxt").value = roomId;
    room = roomId;
    playerId = id;
});

socket.on("restartGame", function (restartData) {
    document.getElementById("logo").style.display = "block";
    canvas.style("display", "none");
    player = null;
    isPlaying = false;
});


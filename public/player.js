class Player {
    constructor(playerName, x, y, radius) {
        this.name = playerName;
        this.position = {"x": x, "y":y};
        this.radius = radius;
        
        this.move = function() {
            
            var vel = createVector(mouseX-width/2, mouseY-height/2);
            var dist = p5.Vector.dist(createVector(mouseX, mouseY), createVector(width/2, height/2));
            if (dist > 200) {
                vel.setMag(4);
            } else {
                vel.setMag(dist / 50);
            }
            if (p5.Vector.dist(createVector(this.position.x + vel.x, this.position.y), createVector(0, 0)) < 1000 - (this.radius / 2)) {
                this.position.x += vel.x;
            } 
            if (p5.Vector.dist(createVector(this.position.x, this.position.y + vel.y), createVector(0, 0)) < 1000 - (this.radius / 2)) {
                this.position.y += vel.y;
            }
        }
    }
}
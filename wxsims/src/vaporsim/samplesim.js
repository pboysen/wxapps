var dotProduct = function(ax, ay, bx, by) {
    return ax * bx + ay * by;
};

frameRate(30);

//Physical variables to play with
var gravity = 0; // Force due to gravity
var friction = 0.9; // Energy lost on collision
var wallTemp = 1;   // Speed of atoms in the walls

//Initial particle speed
var initialSpeed = 5;

//How many iterations before updating the display
var framesNotShown = 3;

var waterCount = 140;
var waterSize = 2;
var waterMass = 10;
var pollenCount = 4;
var pollenSize = 25;
var pollenMass = 100;


// Particles have a position, speed, colour and masss
var Particle = function(x, y, r, c, mass) {
    // Position
    this.x = x;
    this.y = y;
    
    // Radius
    this.r = r;
    this.mass = mass || this.r * this.r;
    
    // Colour
    this.c = c;
    
    // Velocity
    this.dx = initialSpeed * (random() - 0.5) / this.r;
    this.dy = initialSpeed * (random() - 0.5) / this.r;
};

Particle.prototype.draw = function() {
    fill(this.c);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
};

// Move ball based on its velocity
Particle.prototype.move = function() {
    this.x += this.dx;
    this.y += this.dy;
};

Particle.prototype.collide = function(that) {
    var dx = this.x - that.x;
    var dy = this.y - that.y;
    var dr = this.r + that.r;
    var d = dx * dx + dy * dy;
    
    if (d < dr * dr) {
        // Particles collide
        var collisionDist = sqrt(d + 0.1);
        
        // Find unit vector in direction of collision
        var collisionVi = dx / collisionDist;
        var collisionVj = dy / collisionDist;
        
        // Find velocity of particle projected on to collision vector
        var collisionV1 = dotProduct(this.dx, this.dy, dx, dy) / collisionDist;
        var collisionV2 = dotProduct(that.dx, that.dy, dx, dy) / collisionDist;
        
        // Find velocity of particle perpendicular to collision vector
        var perpV1 = dotProduct(this.dx, this.dy, -dy, dx) / collisionDist;
        var perpV2 = dotProduct(that.dx, that.dy, -dy, dx) / collisionDist;
        
        // Find movement in direction of collision
        var sumMass = this.mass + that.mass;
        var diffMass = this.mass - that.mass;
        var v1p = (diffMass * collisionV1 + 2 * that.mass * collisionV2) / sumMass;
        var v2p = (2 * this.mass * collisionV1 - diffMass * collisionV2) / sumMass;
        
        // Update velocities
        this.dx = v1p * collisionVi - perpV1 * collisionVj;
        this.dy = v1p * collisionVj + perpV1 * collisionVi;
        that.dx = v2p * collisionVi - perpV2 * collisionVj;
        that.dy = v2p * collisionVj + perpV2 * collisionVi;
        
        // Move to avoid overlap
        var overlap = dr + 1 - collisionDist;
        var p1 = overlap * that.mass / sumMass;
        var p2 = overlap * this.mass / sumMass;
        this.x += collisionVi * p1;
        this.y += collisionVj * p1;
        that.x -= collisionVi * p2;
        that.y -= collisionVj * p2;
    }
};

// Bounce off walls
Particle.prototype.bounce = function() {
    // Magnitude of velocity
    let temp = dist(0, 0, this.dx, this.dy);
    let dtemp = (temp + wallTemp) / (2 * temp);
    if (this.x < this.r) {
        this.x = this.r;
        this.dx *= -dtemp;
    }
    if (this.x > width - this.r){
        this.x = width - this.r;
        this.dx *= -dtemp;
    }
    if (this.y < this.r) {
        this.y = this.r;
        this.dy *= -dtemp;
    }
    if (this.y > height - this.r){
        this.y = height - this.r;
        this.dy *= -dtemp;
    }
};

// Test whether mouse is over ball
Particle.prototype.selected = function() {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
};

var initialiseParticles = function() {
    var particles = [];
    
    // Water
    for (var i = 0; i < waterCount; i++) {
        var x = waterSize + round(random() * (400 - 2 * waterSize));
        var y = waterSize + round(random() * (400 - 2 * waterSize));
        var c = color(40, 60, 160, 200);
        particles.push(new Particle(x, y, waterSize, c, waterMass));
    }
    
    // Pollen
    for (var i = 0; i < pollenCount; i++) {
        var x = pollenSize + round(random() * (400 - 2 * pollenSize));
        var y = pollenSize + round(random() * (400 - 2 * pollenSize));
        var c = color(160, 60, 40, 200);
        particles.push(new Particle(x, y, pollenSize, c, pollenMass));
    }
    
    return particles;
};

var particles = initialiseParticles();
var particleCount = particles.length;
noStroke();

var i, j, ball;
var update = function(n) {
    for (var t = 0; t < n; t++) {
        // Calculate acceleration
        for (i = 0; i < particleCount; i++) {
            for (j = i + 1; j < particleCount; j++){
                particles[i].collide(particles[j]);
            }
        }
        
        // Move particles
        for (i = 0; i < particleCount; i++) {
            ball = particles[i];
            ball.move();
            ball.bounce();
        }   
    }
};

var draw = function() {
    background(BACKGROUND);
    
    for (i = 0; i < particleCount; i++) {
        particles[i].draw();
    }
    
    update(framesNotShown);
};
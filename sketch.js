let gridSize = 10; // Distance between particles in the grid
let interactionRadius = 30; // Interaction range for mouse hover
let particleSize = 2; // Size of each particle
let gridParticles = []; // Store all particles in the grid
let mousePath = []; // Store points for the drawn path
let attractionForce = 0.8; // Force that moves particles toward the mouse path
let returnForce = 0.5; // Force to bring particles back to their home position
let damping = 0.9; // Damping factor for smoother motion
let hoverEndTime = 0; // Time when the hover ends

function setup() {
  createCanvas(windowWidth, windowHeight); // Set canvas size to full window

  // Generate particle grid
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      gridParticles.push(new Particle(x, y));
    }
  }
}

function draw() {
  background(0);

  // Store mouse path if mouse is pressed (to leave a trail)
  if (mouseIsPressed) {
    mousePath.push(createVector(mouseX, mouseY));
    hoverEndTime = millis(); // Update hover end time when mouse is pressed
  }

  // Update and draw particles
  gridParticles.forEach((particle) => {
    particle.moveToPath(mousePath); // Move particles toward the path while mouse is active
    particle.returnToHome(); // Smoothly return to home after interaction
    particle.update(); // Update position and velocity
    particle.show(); // Draw the particle
  });

  // Clear the mouse path after 1 second of no interaction
  if (millis() - hoverEndTime > 1000) {
    mousePath = []; // Clear the mouse path
  }

  // Limit mouse path length for fade-out effect
  if (mousePath.length > 50) {
    mousePath.shift(); // Remove the oldest point
  }

  // Check for the letter once the mouse stops interacting
  if (mousePath.length > 0 && millis() - hoverEndTime > 1000) {
    let detectedLetter = detectLetter(mousePath);
    if (detectedLetter) {
      console.log("Detected letter: " + detectedLetter);
    }
  }
}

// Particle class that handles movement and interaction with the mouse path
class Particle {
  constructor(x, y) {
    this.home = createVector(x, y); // Particle's home position
    this.pos = this.home.copy(); // Initial position at home
    this.vel = createVector(0, 0); // Velocity for movement
    this.acc = createVector(0, 0); // Acceleration for smooth movement
    this.size = particleSize; // Particle size
    this.movingToPath = false; // To track if the particle is moving toward the path
    this.lastHoverTime = 0; // Last time the particle was hovered over by the mouse
  }

  moveToPath(path) {
    // Find the closest point in the path to the particle
    let closestDist = Infinity;
    let closestPoint = null;

    for (let i = 0; i < path.length; i++) {
      let distance = p5.Vector.dist(path[i], this.pos);
      if (distance < closestDist) {
        closestDist = distance;
        closestPoint = path[i];
      }
    }

    // If the particle is near the path, move toward the closest point
    if (closestPoint && closestDist < interactionRadius) {
      let force = p5.Vector.sub(closestPoint, this.pos); // Vector pointing towards the closest path point
      force.normalize(); // Normalize to keep the movement consistent
      force.mult(attractionForce); // Scale force to control the speed
      this.acc.add(force); // Apply the force as acceleration
      this.movingToPath = true; // Track that the particle is moving toward the path
      this.lastHoverTime = millis(); // Update hover time when the particle is near the path
    } else {
      this.movingToPath = false; // Particle stops moving to the path when it's not near it
    }
  }

  returnToHome() {
    // If the particle has finished interacting with the path, move it back to its original position
    if (!this.movingToPath && millis() - this.lastHoverTime > 1000) {
      let force = p5.Vector.sub(this.home, this.pos); // Vector pointing back to the home position
      force.normalize(); // Normalize the force
      force.mult(returnForce); // Apply return force to control the rate of return
      this.acc.add(force); // Apply the force as acceleration
    }
  }

  update() {
    // Update position based on velocity and apply damping
    this.vel.add(this.acc); // Update velocity
    this.vel.mult(damping); // Apply damping to smooth the motion
    this.pos.add(this.vel); // Update position
    this.acc.mult(0); // Reset acceleration for the next frame
  }

  show() {
    noStroke();
    fill(255); // Keep the particles white
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

// Function to detect a letter based on the mouse path
function detectLetter(path) {
  let letter = "";

  // Example detection for the letter "M"
  if (isM(path)) {
    letter = "M";
  }
  // Example detection for the letter "A"
  else if (isA(path)) {
    letter = "A";
  }
  // Add more letter detection functions as needed

  return letter;
}

// Basic function to check if the path resembles an "M"
function isM(path) {
  if (path.length < 10) return false; // Ensure the path has enough points to analyze

  let peaks = 0;
  for (let i = 1; i < path.length - 1; i++) {
    let p0 = path[i - 1];
    let p1 = path[i];
    let p2 = path[i + 1];
    if (p1.y < p0.y && p1.y < p2.y) { // A simple peak detection
      peaks++;
    }
  }
  return peaks >= 4; // "M" typically has 4 peaks
}

// Basic function to check if the path resembles an "A"
function isA(path) {
  if (path.length < 10) return false;

  let peak = 0;
  let minY = Math.min(...path.map(p => p.y));
  for (let i = 1; i < path.length - 1; i++) {
    let p0 = path[i - 1];
    let p1 = path[i];
    let p2 = path[i + 1];
    if (p1.y < p0.y && p1.y < p2.y && p1.y === minY) {
      peak++;
    }
  }
  return peak === 1; // "A" should have one peak
}

// Adjust canvas size on window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gridParticles = []; // Reset particle grid to match new canvas size

  // Regenerate particle grid with new canvas dimensions
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      gridParticles.push(new Particle(x, y));
    }
  }
}

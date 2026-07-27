// PEPPA'S ADVENTURE - Platformer game with Peppa Pig characters

let peppaCanvas, peppaCtx;
let peppaGameRunning = true;
let peppaScore = 0;
let peppaLives = 3;
let peppaLevel = 1;
let peppaAnimationFrame = 0;
let peppaLastFrameTime = 0;
const PEPPA_FPS = 30;
const PEPPA_FRAME_DELAY = 1000 / PEPPA_FPS;

// Physics
const GRAVITY = 0.6;
const JUMP_STRENGTH = 12;

// Player (Peppa)
const peppaPlayer = {
    x: 100,
    y: 400,
    width: 30,
    height: 40,
    vx: 3,
    vy: 0,
    jumping: false,
    color: '#ff7ec7'
};

let peppaPlatforms = [];
let peppaEnemies = [];
let peppaCollectibles = [];
let peppaParticles = [];
let peppaCamera = { x: 0, y: 0 };

function initializePeppaCanvas() {
    if (peppaCanvas) return;
    peppaCanvas = document.getElementById('gameCanvas');
    peppaCtx = peppaCanvas.getContext('2d');
    peppaCanvas.width = 800;
    peppaCanvas.height = 600;
}

// Platform class
class PeppaPlatform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // normal, moving, crumbling
        this.moveSpeed = 0;
        this.direction = 1;
    }

    update() {
        if (this.type === 'moving') {
            this.x += this.moveSpeed * this.direction;
            if (this.x < 0 || this.x + this.width > peppaCanvas.width * 2) {
                this.direction *= -1;
            }
        }
    }

    draw() {
        // Platform color based on type
        let color = '#8B4513'; // Brown
        if (this.type === 'moving') color = '#FFD700'; // Gold

        peppaCtx.fillStyle = color;
        peppaCtx.fillRect(this.x, this.y, this.width, this.height);

        // Platform border
        peppaCtx.strokeStyle = '#654321';
        peppaCtx.lineWidth = 2;
        peppaCtx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Enemy class (Dr. Brown or other characters)
class PeppaCharacter {
    constructor(x, y, type = 'brown') {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 45;
        this.type = type; // 'brown' (enemy), 'george' (collectible), 'mama', 'papa'
        this.vx = type === 'brown' ? 2 : 0;
        this.vy = 0;
        this.onPlatform = false;
    }

    update() {
        // Apply gravity
        this.vy += GRAVITY;
        this.y += this.vy;

        // Check platform collisions
        this.onPlatform = false;
        for (let platform of peppaPlatforms) {
            if (this.vy >= 0 &&
                this.y + this.height <= platform.y + 5 &&
                this.y + this.height + this.vy >= platform.y &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.onPlatform = true;
            }
        }

        // Movement
        this.x += this.vx;

        // Bounce off walls
        if (this.x < 0 || this.x + this.width > peppaCanvas.width * 2) {
            this.vx *= -1;
        }

        // Fall off screen
        if (this.y > peppaCanvas.height + 100) {
            return true; // Should be removed
        }
        return false;
    }

    draw() {
        if (this.type === 'brown') {
            // Dra. Brown - Bear (enemy)
            peppaCtx.fillStyle = '#8B5A3C';

            // Large round head (characteristic of bear)
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + this.width / 2, this.y + 12, 12, 0, Math.PI * 2);
            peppaCtx.fill();

            // Ears (two circles on top)
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 8, this.y - 2, 4, 0, Math.PI * 2);
            peppaCtx.fill();
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 22, this.y - 2, 4, 0, Math.PI * 2);
            peppaCtx.fill();

            // Eyes (black)
            peppaCtx.fillStyle = '#000';
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 10, this.y + 7, 2, 0, Math.PI * 2);
            peppaCtx.fill();
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 18, this.y + 7, 2, 0, Math.PI * 2);
            peppaCtx.fill();

            // Body below head
            peppaCtx.fillStyle = '#8B5A3C';
            peppaCtx.beginPath();
            peppaCtx.ellipse(this.x + this.width / 2, this.y + 28, 11, 13, 0, 0, Math.PI * 2);
            peppaCtx.fill();
        } else if (this.type === 'george') {
            // George Pig - Small red pig (collectible)
            peppaCtx.fillStyle = '#E63946';

            // Smaller head/body (oval, similar to Peppa but smaller)
            peppaCtx.beginPath();
            peppaCtx.ellipse(this.x + this.width / 2, this.y + 14, 10, 14, 0, 0, Math.PI * 2);
            peppaCtx.fill();

            // Smaller snout
            peppaCtx.beginPath();
            peppaCtx.ellipse(this.x + 4, this.y + 12, 4, 6, 0, 0, Math.PI * 2);
            peppaCtx.fill();

            // Small ears
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 8, this.y - 1, 2.5, 0, Math.PI * 2);
            peppaCtx.fill();
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 18, this.y - 1, 2.5, 0, Math.PI * 2);
            peppaCtx.fill();

            // Eyes (black, small)
            peppaCtx.fillStyle = '#000';
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 8, this.y + 7, 1.5, 0, Math.PI * 2);
            peppaCtx.fill();
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + 16, this.y + 7, 1.5, 0, Math.PI * 2);
            peppaCtx.fill();

            // Small smile
            peppaCtx.strokeStyle = '#C1121F';
            peppaCtx.lineWidth = 1.5;
            peppaCtx.beginPath();
            peppaCtx.arc(this.x + this.width / 2, this.y + 16, 3, 0, Math.PI);
            peppaCtx.stroke();

            // Legs (small black rectangles)
            peppaCtx.fillStyle = '#000';
            peppaCtx.fillRect(this.x + 8, this.y + 26, 2, 4);
            peppaCtx.fillRect(this.x + 16, this.y + 26, 2, 4);
        }
    }
}

// Collectible items
class PeppaCollectible {
    constructor(x, y, type = 'apple') {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.type = type; // 'apple', 'flower', 'straw'
        this.vy = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.vy += GRAVITY * 0.5;
        this.y += this.vy;
        this.bobOffset += 0.05;
    }

    draw() {
        if (this.type === 'apple') {
            peppaCtx.fillStyle = '#FF0000';
        } else if (this.type === 'flower') {
            peppaCtx.fillStyle = '#FFD700';
        } else {
            peppaCtx.fillStyle = '#FF7EC7';
        }
        peppaCtx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function createPeppaLevel() {
    peppaPlatforms = [];
    peppaEnemies = [];
    peppaCollectibles = [];

    // Starting platform
    peppaPlatforms.push(new PeppaPlatform(0, 500, 200, 20, 'normal'));

    // Level platforms
    let platformX = 200;
    for (let i = 0; i < 15; i++) {
        const y = 500 - (i * 80);
        const width = 100 + Math.random() * 50;
        const type = Math.random() > 0.7 ? 'moving' : 'normal';
        peppaPlatforms.push(new PeppaPlatform(platformX, y, width, 20, type));

        // Add collectibles
        if (Math.random() > 0.5) {
            const types = ['apple', 'flower', 'straw'];
            const cType = types[Math.floor(Math.random() * types.length)];
            peppaCollectibles.push(new PeppaCollectible(platformX + width / 2, y - 40, cType));
        }

        // Add enemies
        if (i > 3 && Math.random() > 0.7) {
            peppaEnemies.push(new PeppaCharacter(platformX + 20, y - 50, 'brown'));
        }

        // Add george (collectible character)
        if (i === 5 || i === 10) {
            peppaEnemies.push(new PeppaCharacter(platformX + 20, y - 50, 'george'));
        }

        platformX += 150 + Math.random() * 100;
    }
}

function updatePeppaPlayer() {
    const keys = {};

    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        peppaPlayer.vx = -3;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        peppaPlayer.vx = 3;
    } else {
        peppaPlayer.vx = 1; // Keep moving right
    }

    // Jump
    if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && peppaPlayer.onPlatform) {
        peppaPlayer.vy = -JUMP_STRENGTH;
        peppaPlayer.jumping = true;
    }

    // Apply gravity
    peppaPlayer.vy += GRAVITY;

    // Update position
    peppaPlayer.x += peppaPlayer.vx;
    peppaPlayer.y += peppaPlayer.vy;

    // Check platform collisions
    peppaPlayer.onPlatform = false;
    for (let platform of peppaPlatforms) {
        if (peppaPlayer.vy >= 0 &&
            peppaPlayer.y + peppaPlayer.height <= platform.y + 5 &&
            peppaPlayer.y + peppaPlayer.height + peppaPlayer.vy >= platform.y &&
            peppaPlayer.x + peppaPlayer.width > platform.x &&
            peppaPlayer.x < platform.x + platform.width) {
            peppaPlayer.y = platform.y - peppaPlayer.height;
            peppaPlayer.vy = 0;
            peppaPlayer.onPlatform = true;
        }
    }

    // Boundaries
    if (peppaPlayer.x < 0) peppaPlayer.x = 0;
    if (peppaPlayer.x + peppaPlayer.width > peppaCanvas.width * 2) {
        peppaPlayer.x = peppaCanvas.width * 2 - peppaPlayer.width;
    }

    // Fall detection
    if (peppaPlayer.y > peppaCanvas.height + 100) {
        peppaLives--;
        if (peppaLives <= 0) {
            endPeppaGame();
        } else {
            peppaPlayer.y = 400;
            peppaPlayer.x = 100;
            peppaPlayer.vy = 0;
        }
    }

    // Update camera
    peppaCamera.x = peppaPlayer.x - 100;
    if (peppaCamera.x < 0) peppaCamera.x = 0;

    // Win condition
    if (peppaPlayer.y < 100) {
        peppaLevel++;
        peppaScore += 500;
        createPeppaLevel();
        peppaPlayer.y = 400;
        peppaPlayer.x = 100;
        peppaCamera.x = 0;
    }
}

function drawPeppaPlayer() {
    const screenX = peppaPlayer.x - peppaCamera.x;
    const y = peppaPlayer.y;

    // Peppa Pig - Rosa brillante
    peppaCtx.fillStyle = '#FF7EC7';

    // Main head/body (large oval pill shape - this is the main characteristic)
    peppaCtx.beginPath();
    peppaCtx.ellipse(screenX + 15, y + 18, 14, 18, 0, 0, Math.PI * 2);
    peppaCtx.fill();

    // Snout (positioned on the left side)
    peppaCtx.beginPath();
    peppaCtx.ellipse(screenX + 1, y + 16, 6, 8, 0, 0, Math.PI * 2);
    peppaCtx.fill();

    // Ears (two circles on top)
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 7, y + 0, 4, 0, Math.PI * 2);
    peppaCtx.fill();
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 23, y + 0, 4, 0, Math.PI * 2);
    peppaCtx.fill();

    // Eyes (large white circles with black pupils)
    peppaCtx.fillStyle = '#FFF';
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 8, y + 12, 4, 0, Math.PI * 2);
    peppaCtx.fill();
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 18, y + 12, 4, 0, Math.PI * 2);
    peppaCtx.fill();

    // Pupils (black)
    peppaCtx.fillStyle = '#000';
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 9, y + 13, 2.5, 0, Math.PI * 2);
    peppaCtx.fill();
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 19, y + 13, 2.5, 0, Math.PI * 2);
    peppaCtx.fill();

    // Mouth/smile (arc below)
    peppaCtx.strokeStyle = '#FF69B4';
    peppaCtx.lineWidth = 2.5;
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 15, y + 20, 5, 0, Math.PI);
    peppaCtx.stroke();

    // Cheek spot (pink circle on the right side)
    peppaCtx.fillStyle = '#FF69B4';
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 26, y + 20, 3, 0, Math.PI * 2);
    peppaCtx.fill();

    // Arms (two small circles on sides)
    peppaCtx.fillStyle = '#FFC0CB';
    peppaCtx.beginPath();
    peppaCtx.ellipse(screenX - 2, y + 24, 3, 6, 0, 0, Math.PI * 2);
    peppaCtx.fill();
    peppaCtx.beginPath();
    peppaCtx.ellipse(screenX + 32, y + 24, 3, 6, 0, 0, Math.PI * 2);
    peppaCtx.fill();

    // Legs (two black rectangles at bottom)
    peppaCtx.fillStyle = '#000';
    peppaCtx.fillRect(screenX + 8, y + 34, 3, 6);
    peppaCtx.fillRect(screenX + 18, y + 34, 3, 6);

    // Tail (curl on right back)
    peppaCtx.strokeStyle = '#FF7EC7';
    peppaCtx.lineWidth = 2;
    peppaCtx.beginPath();
    peppaCtx.arc(screenX + 30, y + 28, 3, 0, Math.PI * 2);
    peppaCtx.stroke();
}

function updatePeppa() {
    if (!peppaGameRunning) return;

    updatePeppaPlayer();

    // Update platforms
    for (let platform of peppaPlatforms) {
        platform.update();
    }

    // Update characters
    for (let i = peppaEnemies.length - 1; i >= 0; i--) {
        if (peppaEnemies[i].update()) {
            peppaEnemies.splice(i, 1);
            continue;
        }

        // Check collision with player
        if (peppaEnemies[i].type === 'brown') {
            if (peppaPlayer.x + peppaPlayer.width > peppaEnemies[i].x &&
                peppaPlayer.x < peppaEnemies[i].x + peppaEnemies[i].width &&
                peppaPlayer.y + peppaPlayer.height > peppaEnemies[i].y &&
                peppaPlayer.y < peppaEnemies[i].y + peppaEnemies[i].height) {
                peppaLives--;
                if (peppaLives <= 0) {
                    endPeppaGame();
                } else {
                    peppaPlayer.y = 400;
                    peppaPlayer.x = 100;
                }
            }
        } else if (peppaEnemies[i].type === 'george') {
            if (peppaPlayer.x + peppaPlayer.width > peppaEnemies[i].x &&
                peppaPlayer.x < peppaEnemies[i].x + peppaEnemies[i].width &&
                peppaPlayer.y + peppaPlayer.height > peppaEnemies[i].y &&
                peppaPlayer.y < peppaEnemies[i].y + peppaEnemies[i].height) {
                peppaScore += 100;
                peppaEnemies.splice(i, 1);
            }
        }
    }

    // Update collectibles
    for (let i = peppaCollectibles.length - 1; i >= 0; i--) {
        peppaCollectibles[i].update();

        if (peppaPlayer.x + peppaPlayer.width > peppaCollectibles[i].x &&
            peppaPlayer.x < peppaCollectibles[i].x + peppaCollectibles[i].width &&
            peppaPlayer.y + peppaPlayer.height > peppaCollectibles[i].y &&
            peppaPlayer.y < peppaCollectibles[i].y + peppaCollectibles[i].height) {
            peppaScore += 10;
            peppaCollectibles.splice(i, 1);
        }
    }

    document.getElementById('score').textContent = peppaScore;
    document.getElementById('lives').textContent = peppaLives;
    document.getElementById('level').textContent = peppaLevel;
}

function drawPeppa() {
    // Sky background
    const gradient = peppaCtx.createLinearGradient(0, 0, 0, peppaCanvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0FFFF');
    peppaCtx.fillStyle = gradient;
    peppaCtx.fillRect(0, 0, peppaCanvas.width, peppaCanvas.height);

    // Draw clouds
    peppaCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 3; i++) {
        const x = (peppaAnimationFrame * 0.2 + i * 300 - peppaCamera.x * 0.3) % peppaCanvas.width;
        peppaCtx.beginPath();
        peppaCtx.arc(x, 50 + i * 60, 30, 0, Math.PI * 2);
        peppaCtx.fill();
        peppaCtx.beginPath();
        peppaCtx.arc(x + 40, 50 + i * 60, 35, 0, Math.PI * 2);
        peppaCtx.fill();
    }

    // Draw platforms
    for (let platform of peppaPlatforms) {
        const screenX = platform.x - peppaCamera.x;
        if (screenX + platform.width > 0 && screenX < peppaCanvas.width) {
            peppaCtx.save();
            peppaCtx.translate(screenX, platform.y);
            peppaCtx.fillStyle = platform.type === 'moving' ? '#FFD700' : '#8B4513';
            peppaCtx.fillRect(0, 0, platform.width, platform.height);
            peppaCtx.strokeStyle = '#654321';
            peppaCtx.lineWidth = 2;
            peppaCtx.strokeRect(0, 0, platform.width, platform.height);
            peppaCtx.restore();
        }
    }

    // Draw collectibles
    for (let item of peppaCollectibles) {
        const screenX = item.x - peppaCamera.x;
        if (screenX + item.width > 0 && screenX < peppaCanvas.width) {
            if (item.type === 'apple') peppaCtx.fillStyle = '#FF0000';
            else if (item.type === 'flower') peppaCtx.fillStyle = '#FFD700';
            else peppaCtx.fillStyle = '#FF69B4';
            peppaCtx.fillRect(screenX, item.y, item.width, item.height);
        }
    }

    // Draw characters
    for (let char of peppaEnemies) {
        const screenX = char.x - peppaCamera.x;
        if (screenX + char.width > 0 && screenX < peppaCanvas.width) {
            if (char.type === 'brown') {
                // Dra. Brown - Oso marrón
                peppaCtx.fillStyle = '#8B5A3C';
                // Cabeza
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + char.width / 2, char.y + 12, 10, 0, Math.PI * 2);
                peppaCtx.fill();
                // Cuerpo
                peppaCtx.beginPath();
                peppaCtx.ellipse(screenX + char.width / 2, char.y + 28, 12, 12, 0, 0, Math.PI * 2);
                peppaCtx.fill();
                // Ojos
                peppaCtx.fillStyle = '#000';
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + 8, char.y + 9, 2, 0, Math.PI * 2);
                peppaCtx.fill();
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + 18, char.y + 9, 2, 0, Math.PI * 2);
                peppaCtx.fill();
            } else if (char.type === 'george') {
                // George Pig - Rojo
                peppaCtx.fillStyle = '#E63946';
                // Cuerpo
                peppaCtx.beginPath();
                peppaCtx.ellipse(screenX + char.width / 2, char.y + 24, 10, 12, 0, 0, Math.PI * 2);
                peppaCtx.fill();
                // Cabeza
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + char.width / 2, char.y + 8, 8, 0, Math.PI * 2);
                peppaCtx.fill();
                // Nariz
                peppaCtx.fillStyle = '#C1121F';
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + char.width / 2 + 2, char.y + 9, 4, 0, Math.PI * 2);
                peppaCtx.fill();
                // Ojos
                peppaCtx.fillStyle = '#000';
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + 10, char.y + 5, 1.5, 0, Math.PI * 2);
                peppaCtx.fill();
                peppaCtx.beginPath();
                peppaCtx.arc(screenX + 14, char.y + 5, 1.5, 0, Math.PI * 2);
                peppaCtx.fill();
            }
        }
    }

    // Draw player
    drawPeppaPlayer();

    // Draw level progress
    peppaCtx.fillStyle = '#000';
    peppaCtx.fillText(`Nivel: ${peppaLevel}`, 10, 30);
}

function endPeppaGame() {
    peppaGameRunning = false;
    document.getElementById('finalScore').textContent = peppaScore;
    document.getElementById('gameOver').style.display = 'block';
}

function resetPeppaGame() {
    peppaScore = 0;
    peppaLives = 3;
    peppaLevel = 1;
    peppaGameRunning = true;
    peppaAnimationFrame = 0;
    peppaLastFrameTime = 0;
    peppaPlayer.x = 100;
    peppaPlayer.y = 400;
    peppaPlayer.vy = 0;
    peppaCamera.x = 0;
    document.getElementById('gameOver').style.display = 'none';
    createPeppaLevel();
    drawPeppa();
}

function peppaGameLoop(currentTime) {
    if (peppaCanvas) {
        if (peppaLastFrameTime === 0) {
            peppaLastFrameTime = currentTime;
        }

        const deltaTime = currentTime - peppaLastFrameTime;

        if (deltaTime >= PEPPA_FRAME_DELAY) {
            updatePeppa();
            drawPeppa();
            peppaAnimationFrame++;
            peppaLastFrameTime = currentTime;
        }
    }

    requestAnimationFrame(peppaGameLoop);
}

requestAnimationFrame(peppaGameLoop);

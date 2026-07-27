// Current game tracking
let currentGame = null;

// Menu and game state management
function startGame(gameName) {
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');

    if (gameName === 'spaceinvaders') {
        initializeCanvas();
        resetGame();
        currentGame = 'spaceinvaders';
    } else if (gameName === 'hoho') {
        initializeHohoCanvas();
        resetHohoGame();
        currentGame = 'hoho';
    } else if (gameName === 'defender') {
        initializeDefenderCanvas();
        resetDefenderGame();
        currentGame = 'defender';
    } else if (gameName === 'peppa') {
        initializePeppaCanvas();
        resetPeppaGame();
        currentGame = 'peppa';
    }
}

function goToMenu() {
    document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('gameOver').style.display = 'none';
    currentGame = null;
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    gameStarted = false;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    particles = [];
    player.x = canvas.width / 2 - 20;
    player.shootCooldown = 0;
    document.getElementById('gameOver').style.display = 'none';
    createEnemyWave();
    draw();
}

let canvas, ctx;

// Initialize after menu selection
function initializeCanvas() {
    if (canvas) return; // Already initialized
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
}

const gameOverScreen = document.getElementById('gameOver');
const finalScoreSpan = document.getElementById('finalScore');

// Game variables
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let gameStarted = false;
let gamepadConnected = false;
let gamepadIndex = null;
let lastFrameTime = 0;
const FPS = 30;
const FRAME_DELAY = 1000 / FPS;
let animationFrame = 0;

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 70,
    width: 40,
    height: 30,
    speed: 4,
    dx: 0,
    shoot: false,
    shootCooldown: 0,
    maxShootCooldown: 5
};

// Bullets
let bullets = [];
let enemyBullets = [];

// Particles for explosions
let particles = [];

// Enemies
let enemies = [];
let waveCount = 0;

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        player.shoot = true;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Gamepad detection and handling
window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad.id);
    gamepadConnected = true;
    gamepadIndex = e.gamepad.index;
    updateGamepadStatus();
});

window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected:', e.gamepad.id);
    gamepadConnected = false;
    gamepadIndex = null;
    updateGamepadStatus();
});

function updateGamepadStatus() {
    const indicator = document.getElementById('gamepadIndicator');
    const buttonsDiv = document.getElementById('gamepadButtons');

    if (gamepadConnected) {
        indicator.className = 'gamepad-connected';
        indicator.textContent = '🎮 Mando conectado';
        buttonsDiv.textContent = 'A=Disparar, Stick izquierdo=Movimiento';
    } else {
        indicator.className = 'gamepad-disconnected';
        indicator.textContent = '🎮 Sin mando';
        buttonsDiv.textContent = '';
    }
}

function handleGamepadInput() {
    if (!gamepadConnected || gamepadIndex === null) return;

    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return;

    // Get left stick input
    const leftStickX = gamepad.axes[0];

    // Reset horizontal movement
    player.dx = 0;

    // Horizontal movement from stick
    if (Math.abs(leftStickX) > 0.5) {
        player.dx = leftStickX > 0 ? player.speed : -player.speed;
    }

    // Also support D-Pad
    if (gamepad.buttons[14]?.pressed) { // D-Pad Left
        player.dx = -player.speed;
    }
    if (gamepad.buttons[15]?.pressed) { // D-Pad Right
        player.dx = player.speed;
    }

    // Firing: Button A (button 0) or Button B (button 1)
    if (gamepad.buttons[0]?.pressed || gamepad.buttons[1]?.pressed) {
        player.shoot = true;
    }
}

// Helper function to draw pixelated sprites
function drawPixel(x, y, size = 4) {
    ctx.fillRect(x, y, size, size);
}

// Create explosion effect with multiple particle types
function createExplosion(x, y, color = '#ffff00') {
    // Main explosion particles
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 25,
            maxLife: 25,
            color: color,
            size: 4 + Math.random() * 2
        });
    }

    // Bright core particles
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const speed = 1 + Math.random() * 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 15,
            maxLife: 15,
            color: '#ffffff',
            size: 2
        });
    }
}

// Enemy constructor
class Enemy {
    constructor(x, y, type = 0) {
        this.x = x;
        this.y = y;
        this.type = type; // 0 = red, 1 = cyan, 2 = magenta
        this.width = 40;
        this.height = 30;
        this.speed = 1 + (level * 0.5);
        this.direction = 1;
        this.shootChance = Math.random() * (0.002 + level * 0.0002) + 0.0001;
    }

    update() {
        this.x += this.speed * this.direction;

        if (Math.random() < this.shootChance) {
            enemyBullets.push({
                x: this.x + this.width / 2 - 3,
                y: this.y + this.height,
                width: 6,
                height: 12,
                speed: 2
            });
        }
    }

    draw() {
        const x = this.x;
        const y = this.y;
        const frame = Math.floor(animationFrame / 10) % 2;

        // Colors with more vibrant palette
        const colors = ['#ff3333', '#00ffff', '#ff00ff'];
        ctx.fillStyle = colors[this.type];
        ctx.strokeStyle = colors[this.type];
        ctx.lineWidth = 1.5;

        if (this.type === 0) {
            // RED - Detailed Octopus/Squid alien
            // Head (square with border)
            ctx.fillRect(x + 6, y + 2, 28, 16);
            ctx.stroke();

            // Body
            ctx.fillRect(x + 8, y + 16, 24, 10);

            // Eyes with pupils
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 12, y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 8, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 12, y + 8, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 8, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Mouth line
            ctx.strokeStyle = colors[this.type];
            ctx.beginPath();
            ctx.moveTo(x + 14, y + 14);
            ctx.lineTo(x + 26, y + 14);
            ctx.stroke();

            // Animated tentacles
            ctx.fillStyle = colors[this.type];
            if (frame === 0) {
                ctx.fillRect(x + 6, y + 26, 3, 3);
                ctx.fillRect(x + 15, y + 26, 3, 3);
                ctx.fillRect(x + 31, y + 26, 3, 3);
            } else {
                ctx.fillRect(x + 8, y + 26, 3, 3);
                ctx.fillRect(x + 17, y + 26, 3, 3);
                ctx.fillRect(x + 29, y + 26, 3, 3);
            }

        } else if (this.type === 1) {
            // CYAN - Detailed Crab alien
            // Head
            ctx.beginPath();
            ctx.arc(x + 12, y + 6, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 6, 5, 0, Math.PI * 2);
            ctx.fill();

            // Body (wider)
            ctx.fillRect(x + 4, y + 12, 32, 12);
            ctx.stroke();

            // Eyes with glow
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x + 12, y + 6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 6, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 12, y + 6, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 6, 1, 0, Math.PI * 2);
            ctx.fill();

            // Animated claws
            ctx.fillStyle = colors[this.type];
            if (frame === 0) {
                ctx.fillRect(x + 1, y + 24, 4, 3);
                ctx.fillRect(x + 10, y + 24, 4, 3);
                ctx.fillRect(x + 26, y + 24, 4, 3);
                ctx.fillRect(x + 35, y + 24, 4, 3);
            } else {
                ctx.fillRect(x + 2, y + 24, 4, 3);
                ctx.fillRect(x + 12, y + 24, 4, 3);
                ctx.fillRect(x + 24, y + 24, 4, 3);
                ctx.fillRect(x + 34, y + 24, 4, 3);
            }

        } else {
            // MAGENTA - Detailed Jellyfish/UFO alien
            // Dome top
            ctx.beginPath();
            ctx.arc(x + 20, y + 6, 10, 0, Math.PI);
            ctx.fill();
            ctx.stroke();

            // Main body
            ctx.fillRect(x + 6, y + 6, 28, 14);
            ctx.stroke();

            // Bottom saucer
            ctx.beginPath();
            ctx.ellipse(x + 20, y + 24, 14, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Center window light
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x + 20, y + 12, 4, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 12, y + 10, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 10, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 12, y + 10, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 28, y + 10, 1, 0, Math.PI * 2);
            ctx.fill();

            // Animated tentacles
            ctx.fillStyle = colors[this.type];
            if (frame === 0) {
                ctx.fillRect(x + 6, y + 28, 3, 3);
                ctx.fillRect(x + 16, y + 28, 3, 3);
                ctx.fillRect(x + 26, y + 28, 3, 3);
            } else {
                ctx.fillRect(x + 8, y + 28, 3, 3);
                ctx.fillRect(x + 18, y + 28, 3, 3);
                ctx.fillRect(x + 28, y + 28, 3, 3);
            }
        }
    }
}

function createEnemyWave() {
    enemies = [];
    waveCount++;

    const rows = 4 + Math.floor(level / 2);
    const cols = 10;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Assign enemy type based on row
            let type = 0;
            if (i === 0) type = 0; // Red
            else if (i === 1 || i === 2) type = 1; // Cyan
            else type = 2; // Magenta

            // Spread enemies across the entire screen width
            const spacing = (canvas.width - 100) / cols;
            enemies.push(new Enemy(20 + j * spacing, 30 + i * 60, type));
        }
    }
}

function updatePlayer() {
    // Keyboard input
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.dx = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.dx = player.speed;
    }

    // Gamepad input
    handleGamepadInput();

    // Update position
    player.x += player.dx;

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Shooting with cooldown
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    if (player.shoot && player.shootCooldown <= 0) {
        bullets.push({
            x: player.x + player.width / 2 - 3,
            y: player.y - 10,
            width: 6,
            height: 15,
            speed: 5
        });
        player.shoot = false;
        player.shootCooldown = player.maxShootCooldown;
        gameStarted = true; // Hide instructions on first shot
    }
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;

    // Main hull - gradient effect
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;

    // Ship body (arrow/triangle pointing up)
    ctx.beginPath();
    ctx.moveTo(x + player.width / 2, y);
    ctx.lineTo(x + player.width, y + player.height / 2);
    ctx.lineTo(x + player.width - 8, y + player.height);
    ctx.lineTo(x + player.width / 2, y + player.height - 5);
    ctx.lineTo(x + 8, y + player.height);
    ctx.lineTo(x, y + player.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit window
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + 14, y + 6, 12, 10);

    // Inner cockpit detail
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 16, y + 8, 8, 6);

    // Side engines glow
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.fillRect(x + 2, y + 18, 4, 8);
    ctx.fillRect(x + 34, y + 18, 4, 8);
}

function updateBullets() {
    // Player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (
                bullets[i].x < enemy.x + enemy.width &&
                bullets[i].x + bullets[i].width > enemy.x &&
                bullets[i].y < enemy.y + enemy.height &&
                bullets[i].y + bullets[i].height > enemy.y
            ) {
                // Score based on enemy type
                const scores = [30, 20, 10];
                score += scores[enemy.type];

                // Create explosion
                const colors = ['#ff3333', '#00ffff', '#ff00ff'];
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, colors[enemy.type]);

                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }

    // Enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBullets[i].speed;
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
            continue;
        }

        // Check collision with player
        if (
            enemyBullets[i].x < player.x + player.width &&
            enemyBullets[i].x + enemyBullets[i].width > player.x &&
            enemyBullets[i].y < player.y + player.height &&
            enemyBullets[i].y + enemyBullets[i].height > player.y
        ) {
            lives--;
            enemyBullets.splice(i, 1);
            if (lives <= 0) {
                endGame();
            }
            break;
        }
    }
}

function drawBullets() {
    // Player bullets - green laser with glow
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 10;
    for (let bullet of bullets) {
        // Main laser beam
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        // Glow effect
        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
        ctx.fillRect(bullet.x - 2, bullet.y - 2, bullet.width + 4, bullet.height + 4);
        ctx.fillStyle = '#00ff00';
    }
    ctx.shadowBlur = 0;

    // Enemy bullets - red plasma with trail
    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = 'rgba(255, 51, 51, 0.8)';
    ctx.shadowBlur = 8;
    for (let bullet of enemyBullets) {
        // Main bullet
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Trail glow
        ctx.fillStyle = 'rgba(255, 51, 51, 0.3)';
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff3333';
    }
    ctx.shadowBlur = 0;
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (let p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        const size = p.size || 4;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        ctx.globalAlpha = 1;
    }
}

function updateEnemies() {
    for (let enemy of enemies) {
        enemy.update();
    }

    // Check if enemies hit the edge
    let changeDirection = false;
    for (let enemy of enemies) {
        if (enemy.x < 20 || enemy.x + enemy.width > canvas.width - 20) {
            changeDirection = true;
            break;
        }
    }

    if (changeDirection) {
        for (let enemy of enemies) {
            enemy.direction *= -1;
            enemy.y += 30;
        }
    }

    // Check if enemies collide with player
    for (let enemy of enemies) {
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            endGame();
            return;
        }
    }

    // Check if enemies reached bottom
    for (let enemy of enemies) {
        if (enemy.y + enemy.height > canvas.height) {
            endGame();
            return;
        }
    }

    // Check if wave is complete
    if (enemies.length === 0) {
        level++;
        createEnemyWave();
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        enemy.draw();
    }
}

function drawUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function endGame() {
    gameRunning = false;
    finalScoreSpan.textContent = score;
    gameOverScreen.style.display = 'block';
}

function update() {
    if (!gameRunning) return;

    updatePlayer();
    updateBullets();
    updateEnemies();
    updateParticles();
    drawUI();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawParticles();
}

function gameLoop(currentTime) {
    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= FRAME_DELAY) {
        update();
        draw();
        animationFrame++;
        lastFrameTime = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game when user starts from menu
updateGamepadStatus();

// Fallback for checking gamepad connections
setInterval(() => {
    const gamepads = navigator.getGamepads?.() || [];
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (!gamepadConnected) {
                gamepadConnected = true;
                gamepadIndex = i;
                updateGamepadStatus();
            }
            break;
        }
    }
}, 500);

// Start the main game loop
function mainGameLoop(currentTime) {
    if (canvas) { // Only run if canvas is initialized
        if (lastFrameTime === 0) {
            lastFrameTime = currentTime;
        }

        const deltaTime = currentTime - lastFrameTime;

        if (deltaTime >= FRAME_DELAY) {
            update();
            draw();
            animationFrame++;
            lastFrameTime = currentTime;
        }
    }

    requestAnimationFrame(mainGameLoop);
}

requestAnimationFrame(mainGameLoop);

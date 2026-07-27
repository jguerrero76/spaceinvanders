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

// Create explosion effect
function createExplosion(x, y, color = '#ffff00') {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = 2 + Math.random() * 3;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20,
            maxLife: 20,
            color: color
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

        // Colors
        const colors = ['#ff3333', '#00ffff', '#ff00ff'];
        ctx.fillStyle = colors[this.type];
        ctx.strokeStyle = colors[this.type];
        ctx.lineWidth = 2;

        // Draw simple but recognizable aliens
        if (this.type === 0) {
            // RED - Octopus style - Higher points
            ctx.fillRect(x + 8, y + 4, 24, 12);
            ctx.fillRect(x + 6, y + 16, 28, 8);

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 10, y + 6, 4, 4);
            ctx.fillRect(x + 26, y + 6, 4, 4);
            ctx.fillStyle = colors[this.type];

            // Tentacles
            if (frame === 0) {
                ctx.fillRect(x + 6, y + 24, 4, 4);
                ctx.fillRect(x + 18, y + 24, 4, 4);
                ctx.fillRect(x + 30, y + 24, 4, 4);
            } else {
                ctx.fillRect(x + 8, y + 24, 4, 4);
                ctx.fillRect(x + 20, y + 24, 4, 4);
                ctx.fillRect(x + 28, y + 24, 4, 4);
            }

        } else if (this.type === 1) {
            // CYAN - Crab style
            ctx.fillRect(x + 6, y + 2, 28, 10);
            ctx.fillRect(x + 4, y + 12, 32, 10);

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 12, y + 4, 4, 4);
            ctx.fillRect(x + 28, y + 4, 4, 4);
            ctx.fillStyle = colors[this.type];

            // Claws
            if (frame === 0) {
                ctx.fillRect(x + 2, y + 22, 4, 4);
                ctx.fillRect(x + 10, y + 22, 4, 4);
                ctx.fillRect(x + 26, y + 22, 4, 4);
                ctx.fillRect(x + 34, y + 22, 4, 4);
            } else {
                ctx.fillRect(x + 4, y + 22, 4, 4);
                ctx.fillRect(x + 14, y + 22, 4, 4);
                ctx.fillRect(x + 22, y + 22, 4, 4);
                ctx.fillRect(x + 32, y + 22, 4, 4);
            }

        } else {
            // MAGENTA - Jellyfish style
            ctx.fillRect(x + 6, y, 28, 14);
            ctx.fillRect(x + 8, y + 14, 24, 10);

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 12, y + 4, 4, 4);
            ctx.fillRect(x + 28, y + 4, 4, 4);
            ctx.fillStyle = colors[this.type];

            // Tentacles
            if (frame === 0) {
                ctx.fillRect(x + 6, y + 24, 4, 4);
                ctx.fillRect(x + 16, y + 24, 4, 4);
                ctx.fillRect(x + 26, y + 24, 4, 4);
            } else {
                ctx.fillRect(x + 10, y + 24, 4, 4);
                ctx.fillRect(x + 20, y + 24, 4, 4);
                ctx.fillRect(x + 30, y + 24, 4, 4);
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
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    // Simple space invaders ship
    // Top point
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width - 6, player.y + player.height);
    ctx.lineTo(player.x + 6, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillRect(player.x + 14, player.y + 6, 12, 8);
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
    // Player bullets - green laser
    ctx.fillStyle = '#00ff00';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Enemy bullets - red plasma
    ctx.fillStyle = '#ff3333';
    for (let bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
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
        ctx.fillRect(p.x, p.y, 4, 4);
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

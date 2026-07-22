const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreSpan = document.getElementById('finalScore');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = true;
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
    height: 40,
    speed: 3,
    dx: 0,
    shoot: false
};

// Bullets
let bullets = [];
let enemyBullets = [];

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
    const leftStickY = gamepad.axes[1];

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

// Enemy constructor
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 1 + (level * 0.3);
        this.direction = 1;
        this.shootChance = Math.random() * 0.008 + 0.0005;
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
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = '#f00';
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 1;

        // Animation frame (toggles every few frames)
        const frame = Math.floor(animationFrame / 10) % 2;

        // Draw alien invader (classic Space Invaders style)
        // Body
        ctx.fillRect(x + 5, y + 8, w - 10, h - 10);

        // Head
        ctx.fillRect(x + 8, y + 2, w - 16, 6);

        // Eyes
        ctx.fillRect(x + 10, y + 4, 3, 2);
        ctx.fillRect(x + w - 13, y + 4, 3, 2);

        // Legs (animation)
        if (frame === 0) {
            ctx.fillRect(x + 8, y + h - 5, 3, 5);
            ctx.fillRect(x + w - 11, y + h - 5, 3, 5);
        } else {
            ctx.fillRect(x + 6, y + h - 5, 3, 5);
            ctx.fillRect(x + w - 9, y + h - 5, 3, 5);
        }

        // Border
        ctx.strokeRect(x + 5, y + 8, w - 10, h - 10);
    }
}

function createEnemyWave() {
    enemies = [];
    waveCount++;
    const rows = 3 + Math.floor(level / 2);
    const cols = 8;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            enemies.push(new Enemy(j * 80 + 50, i * 60 + 30));
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

    // Shooting
    if (player.shoot) {
        bullets.push({
            x: player.x + player.width / 2 - 3,
            y: player.y - 10,
            width: 6,
            height: 15,
            speed: 5
        });
        player.shoot = false;
    }
}

function drawPlayer() {
    // Draw spaceship (classic Space Invaders style)
    ctx.fillStyle = '#0f0';
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;

    // Main body
    ctx.fillRect(player.x + 5, player.y + 15, 30, 20);

    // Top point
    ctx.beginPath();
    ctx.moveTo(player.x + 20, player.y);
    ctx.lineTo(player.x + 15, player.y + 15);
    ctx.lineTo(player.x + 25, player.y + 15);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillRect(player.x, player.y + 10, 5, 15);
    ctx.fillRect(player.x + 35, player.y + 10, 5, 15);

    // Engine glow
    ctx.fillStyle = '#0a0';
    ctx.fillRect(player.x + 15, player.y + 35, 10, 5);
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
                score += 10;
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
    // Player bullets - green laser style
    ctx.fillStyle = '#0f0';
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 1;
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Enemy bullets - red/orange plasma
    ctx.fillStyle = '#ff6600';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    for (let bullet of enemyBullets) {
        // Diamond/star shape for enemy bullets
        ctx.beginPath();
        ctx.moveTo(bullet.x + bullet.width / 2, bullet.y);
        ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height / 2);
        ctx.lineTo(bullet.x + bullet.width / 2, bullet.y + bullet.height);
        ctx.lineTo(bullet.x, bullet.y + bullet.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
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
    drawUI();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
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

// Initialize game
createEnemyWave();
updateGamepadStatus();
gameLoop();

// Fallback for checking gamepad connections (some browsers need polling)
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

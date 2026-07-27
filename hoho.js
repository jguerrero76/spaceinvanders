// HOHO Game - Dodge snowballs and survive winter!

let hohoCanvas, hohoCtx;
let hohoGameRunning = true;
let hohoScore = 0;
let hohoLives = 3;
let hohoLevel = 1;
let hohoAnimationFrame = 0;
let hohoLastFrameTime = 0;
const HOHO_FPS = 30;
const HOHO_FRAME_DELAY = 1000 / HOHO_FPS;

// Player (Hoho)
const hohoPlayer = {
    x: 400,
    y: 500,
    width: 40,
    height: 50,
    speed: 5,
    dx: 0,
    invulnerableFrames: 0
};

let hohoEnemies = [];
let hohoSnowballs = [];
let hohoParticles = [];

function initializeHohoCanvas() {
    if (hohoCanvas) return;
    hohoCanvas = document.getElementById('gameCanvas');
    hohoCtx = hohoCanvas.getContext('2d');
    hohoCanvas.width = 800;
    hohoCanvas.height = 600;
}

class HohoEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;
        this.shootCooldown = 0;
        this.maxShootCooldown = Math.random() * 60 + 30;
    }

    update() {
        this.shootCooldown--;
        if (this.shootCooldown <= 0) {
            // Shoot snowball towards player
            const dx = hohoPlayer.x - this.x;
            const dy = hohoPlayer.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            hohoSnowballs.push({
                x: this.x + this.width / 2,
                y: this.y + this.height,
                vx: (dx / dist) * 3,
                vy: (dy / dist) * 3,
                radius: 6
            });

            this.shootCooldown = this.maxShootCooldown;
        }
    }

    draw() {
        const x = this.x;
        const y = this.y;
        const centerX = x + this.width / 2;

        hohoCtx.fillStyle = '#87CEEB';

        // Bottom snowball (enemy - ice blue)
        hohoCtx.beginPath();
        hohoCtx.arc(centerX, y + 35, 16, 0, Math.PI * 2);
        hohoCtx.fill();
        hohoCtx.strokeStyle = '#5A9FBD';
        hohoCtx.lineWidth = 1.5;
        hohoCtx.stroke();

        // Middle snowball
        hohoCtx.fillStyle = '#87CEEB';
        hohoCtx.beginPath();
        hohoCtx.arc(centerX, y + 15, 12, 0, Math.PI * 2);
        hohoCtx.fill();
        hohoCtx.strokeStyle = '#5A9FBD';
        hohoCtx.lineWidth = 1.5;
        hohoCtx.stroke();

        // Head snowball
        hohoCtx.fillStyle = '#87CEEB';
        hohoCtx.beginPath();
        hohoCtx.arc(centerX, y + 2, 8, 0, Math.PI * 2);
        hohoCtx.fill();
        hohoCtx.strokeStyle = '#5A9FBD';
        hohoCtx.lineWidth = 1.5;
        hohoCtx.stroke();

        // Evil eyes (red)
        hohoCtx.fillStyle = '#ff3333';
        hohoCtx.beginPath();
        hohoCtx.arc(centerX - 4, y - 1, 2, 0, Math.PI * 2);
        hohoCtx.fill();
        hohoCtx.beginPath();
        hohoCtx.arc(centerX + 4, y - 1, 2, 0, Math.PI * 2);
        hohoCtx.fill();

        // Evil mouth
        hohoCtx.strokeStyle = '#ff3333';
        hohoCtx.lineWidth = 2;
        hohoCtx.beginPath();
        hohoCtx.arc(centerX, y + 3, 3, 0, Math.PI, true);
        hohoCtx.stroke();

        // Stick arms with icicles
        hohoCtx.strokeStyle = '#8B6F47';
        hohoCtx.lineWidth = 3;
        hohoCtx.beginPath();
        hohoCtx.moveTo(x - 10, y + 30);
        hohoCtx.lineTo(x - 30, y + 20);
        hohoCtx.stroke();

        hohoCtx.beginPath();
        hohoCtx.moveTo(x + 50, y + 30);
        hohoCtx.lineTo(x + 70, y + 20);
        hohoCtx.stroke();

        // Icicle effect on arms
        hohoCtx.fillStyle = '#b0e0e6';
        for (let i = 0; i < 3; i++) {
            hohoCtx.beginPath();
            hohoCtx.arc(x - 15 - i * 5, y + 25 - i * 3, 2, 0, Math.PI * 2);
            hohoCtx.fill();
            hohoCtx.beginPath();
            hohoCtx.arc(x + 55 + i * 5, y + 25 - i * 3, 2, 0, Math.PI * 2);
            hohoCtx.fill();
        }
    }
}

function updateHohoPlayer() {
    const keys = {};

    // Keyboard input
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        hohoPlayer.dx = -hohoPlayer.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        hohoPlayer.dx = hohoPlayer.speed;
    } else {
        hohoPlayer.dx = 0;
    }

    hohoPlayer.x += hohoPlayer.dx;

    // Boundaries
    if (hohoPlayer.x < 0) hohoPlayer.x = 0;
    if (hohoPlayer.x + hohoPlayer.width > hohoCanvas.width)
        hohoPlayer.x = hohoCanvas.width - hohoPlayer.width;

    // Invulnerability timer
    if (hohoPlayer.invulnerableFrames > 0) {
        hohoPlayer.invulnerableFrames--;
    }
}

function drawHohoPlayer() {
    // Flash when invulnerable
    if (hohoPlayer.invulnerableFrames > 0 && Math.floor(hohoAnimationFrame / 5) % 2 === 0) {
        return;
    }

    const x = hohoPlayer.x;
    const y = hohoPlayer.y;
    const centerX = x + hohoPlayer.width / 2;

    hohoCtx.fillStyle = '#fff';

    // Bottom snowball (largest)
    hohoCtx.beginPath();
    hohoCtx.arc(centerX, y + 35, 16, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.strokeStyle = '#e0e0e0';
    hohoCtx.lineWidth = 1.5;
    hohoCtx.stroke();

    // Middle snowball
    hohoCtx.fillStyle = '#fff';
    hohoCtx.beginPath();
    hohoCtx.arc(centerX, y + 15, 12, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.strokeStyle = '#e0e0e0';
    hohoCtx.lineWidth = 1.5;
    hohoCtx.stroke();

    // Head snowball (top)
    hohoCtx.fillStyle = '#fff';
    hohoCtx.beginPath();
    hohoCtx.arc(centerX, y + 2, 8, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.strokeStyle = '#e0e0e0';
    hohoCtx.lineWidth = 1.5;
    hohoCtx.stroke();

    // Eyes - black coal
    hohoCtx.fillStyle = '#000';
    hohoCtx.beginPath();
    hohoCtx.arc(centerX - 4, y - 1, 1.5, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.beginPath();
    hohoCtx.arc(centerX + 4, y - 1, 1.5, 0, Math.PI * 2);
    hohoCtx.fill();

    // Carrot nose (orange)
    hohoCtx.fillStyle = '#ff9900';
    hohoCtx.beginPath();
    hohoCtx.moveTo(centerX, y + 2);
    hohoCtx.lineTo(centerX + 3, y + 4);
    hohoCtx.lineTo(centerX, y + 6);
    hohoCtx.closePath();
    hohoCtx.fill();

    // Smile (coal buttons)
    hohoCtx.fillStyle = '#000';
    hohoCtx.beginPath();
    hohoCtx.arc(centerX - 3, y + 8, 1, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.beginPath();
    hohoCtx.arc(centerX + 3, y + 8, 1, 0, Math.PI * 2);
    hohoCtx.fill();

    // Coal buttons on body
    hohoCtx.beginPath();
    hohoCtx.arc(centerX - 2, y + 18, 1, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.beginPath();
    hohoCtx.arc(centerX + 2, y + 18, 1, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.beginPath();
    hohoCtx.arc(centerX - 3, y + 26, 1.5, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.beginPath();
    hohoCtx.arc(centerX, y + 28, 1.5, 0, Math.PI * 2);
    hohoCtx.fill();
    hohoCtx.beginPath();
    hohoCtx.arc(centerX + 3, y + 26, 1.5, 0, Math.PI * 2);
    hohoCtx.fill();

    // Smile
    hohoCtx.strokeStyle = '#000';
    hohoCtx.lineWidth = 2;
    hohoCtx.beginPath();
    hohoCtx.arc(hohoPlayer.x + hohoPlayer.width / 2, hohoPlayer.y + 20, 5, 0, Math.PI);
    hohoCtx.stroke();

    // Stick arms
    hohoCtx.strokeStyle = '#8B6F47';
    hohoCtx.lineWidth = 3;
    hohoCtx.beginPath();
    hohoCtx.moveTo(hohoPlayer.x - 10, hohoPlayer.y + 30);
    hohoCtx.lineTo(hohoPlayer.x - 30, hohoPlayer.y + 25);
    hohoCtx.stroke();

    hohoCtx.beginPath();
    hohoCtx.moveTo(hohoPlayer.x + hohoPlayer.width + 10, hohoPlayer.y + 30);
    hohoCtx.lineTo(hohoPlayer.x + hohoPlayer.width + 30, hohoPlayer.y + 25);
    hohoCtx.stroke();
}

function updateHohoSnowballs() {
    for (let i = hohoSnowballs.length - 1; i >= 0; i--) {
        const ball = hohoSnowballs[i];
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Check if out of bounds
        if (ball.y > hohoCanvas.height) {
            hohoSnowballs.splice(i, 1);
            continue;
        }

        // Check collision with player
        if (hohoPlayer.invulnerableFrames <= 0) {
            const dx = ball.x - (hohoPlayer.x + hohoPlayer.width / 2);
            const dy = ball.y - (hohoPlayer.y + hohoPlayer.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ball.radius + 20) {
                hohoLives--;
                hohoPlayer.invulnerableFrames = 60;
                hohoSnowballs.splice(i, 1);

                // Create particles
                for (let j = 0; j < 10; j++) {
                    const angle = (Math.PI * 2 * j) / 10;
                    hohoParticles.push({
                        x: ball.x,
                        y: ball.y,
                        vx: Math.cos(angle) * 2,
                        vy: Math.sin(angle) * 2,
                        life: 20,
                        maxLife: 20
                    });
                }

                if (hohoLives <= 0) {
                    endHohoGame();
                }
            }
        }
    }
}

function drawHohoSnowballs() {
    for (let ball of hohoSnowballs) {
        // Snowball glow effect
        hohoCtx.fillStyle = 'rgba(200, 230, 255, 0.4)';
        hohoCtx.beginPath();
        hohoCtx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
        hohoCtx.fill();

        // Main snowball
        hohoCtx.fillStyle = '#ffffff';
        hohoCtx.beginPath();
        hohoCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        hohoCtx.fill();

        // Snowball edge highlight
        hohoCtx.strokeStyle = '#e0f0ff';
        hohoCtx.lineWidth = 2;
        hohoCtx.beginPath();
        hohoCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        hohoCtx.stroke();

        // Ice sparkle (little highlight)
        hohoCtx.fillStyle = '#ffffff';
        hohoCtx.beginPath();
        hohoCtx.arc(ball.x - ball.radius * 0.4, ball.y - ball.radius * 0.4, 1.5, 0, Math.PI * 2);
        hohoCtx.fill();
    }
}

function updateHohoEnemies() {
    for (let enemy of hohoEnemies) {
        enemy.update();
    }
}

function drawHohoEnemies() {
    for (let enemy of hohoEnemies) {
        enemy.draw();
    }
}

function updateHohoParticles() {
    for (let i = hohoParticles.length - 1; i >= 0; i--) {
        const p = hohoParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life--;

        if (p.life <= 0) {
            hohoParticles.splice(i, 1);
        }
    }
}

function drawHohoParticles() {
    for (let p of hohoParticles) {
        const alpha = p.life / p.maxLife;
        hohoCtx.globalAlpha = alpha;
        hohoCtx.fillStyle = '#ffffff';
        hohoCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
        hohoCtx.globalAlpha = 1;
    }
}

function createHohoWave() {
    hohoEnemies = [];
    const count = 2 + Math.floor(hohoLevel / 2);

    for (let i = 0; i < count; i++) {
        const x = 50 + (i % 3) * 300;
        const y = 50 + Math.floor(i / 3) * 80;
        hohoEnemies.push(new HohoEnemy(x, y));
    }
}

function updateHoho() {
    if (!hohoGameRunning) return;

    updateHohoPlayer();
    updateHohoSnowballs();
    updateHohoEnemies();
    updateHohoParticles();

    // Update UI
    document.getElementById('score').textContent = hohoScore;
    document.getElementById('lives').textContent = hohoLives;
    document.getElementById('level').textContent = hohoLevel;

    // Increase score over time
    hohoScore += 1;

    // Level up if survived long enough
    if (hohoScore % 500 === 0) {
        hohoLevel++;
        createHohoWave();
    }
}

function drawHoho() {
    // Clear canvas with winter gradient
    hohoCtx.fillStyle = '#e6f3ff';
    hohoCtx.fillRect(0, 0, hohoCanvas.width, hohoCanvas.height);

    // Snowflakes background
    hohoCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
        const x = (hohoAnimationFrame * 0.5 + i * 100) % hohoCanvas.width;
        const y = (hohoAnimationFrame * 0.3 + i * 50) % hohoCanvas.height;
        hohoCtx.beginPath();
        hohoCtx.arc(x, y, 2, 0, Math.PI * 2);
        hohoCtx.fill();
    }

    drawHohoPlayer();
    drawHohoSnowballs();
    drawHohoEnemies();
    drawHohoParticles();
}

function endHohoGame() {
    hohoGameRunning = false;
    document.getElementById('finalScore').textContent = hohoScore;
    document.getElementById('gameOver').style.display = 'block';
}

function resetHohoGame() {
    hohoScore = 0;
    hohoLives = 3;
    hohoLevel = 1;
    hohoGameRunning = true;
    hohoAnimationFrame = 0;
    hohoLastFrameTime = 0;
    hohoEnemies = [];
    hohoSnowballs = [];
    hohoParticles = [];
    hohoPlayer.x = hohoCanvas.width / 2 - 20;
    hohoPlayer.invulnerableFrames = 0;
    document.getElementById('gameOver').style.display = 'none';
    createHohoWave();
    drawHoho();
}

function hohoGameLoop(currentTime) {
    if (hohoCanvas) {
        if (hohoLastFrameTime === 0) {
            hohoLastFrameTime = currentTime;
        }

        const deltaTime = currentTime - hohoLastFrameTime;

        if (deltaTime >= HOHO_FRAME_DELAY) {
            updateHoho();
            drawHoho();
            hohoAnimationFrame++;
            hohoLastFrameTime = currentTime;
        }
    }

    requestAnimationFrame(hohoGameLoop);
}

requestAnimationFrame(hohoGameLoop);

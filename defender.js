// DEFENDER GAME - Collect items and defend!

let defenderCanvas, defenderCtx;
let defenderGameRunning = true;
let defenderScore = 0;
let defenderLives = 3;
let defenderLevel = 1;
let defenderAnimationFrame = 0;
let defenderLastFrameTime = 0;
const DEFENDER_FPS = 30;
const DEFENDER_FRAME_DELAY = 1000 / DEFENDER_FPS;

// Player (Green Defender)
const defenderPlayer = {
    x: 400,
    y: 500,
    width: 60,
    height: 60,
    speed: 5,
    dx: 0
};

let defenderEnemies = [];
let defenderItems = [];
let defenderParticles = [];

function initializeDefenderCanvas() {
    if (defenderCanvas) return;
    defenderCanvas = document.getElementById('gameCanvas');
    defenderCtx = defenderCanvas.getContext('2d');
    defenderCanvas.width = 800;
    defenderCanvas.height = 600;
}

class DefenderEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 30;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 1 + 0.5;
        this.shootCooldown = Math.random() * 60 + 30;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x + this.width > defenderCanvas.width) {
            this.vx *= -1;
        }

        this.shootCooldown--;
        if (this.shootCooldown <= 0 && Math.random() < 0.3) {
            // Drop item
            const itemTypes = ['good', 'good', 'bad'];
            const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];

            defenderItems.push({
                x: this.x + this.width / 2,
                y: this.y + this.height,
                vx: 0,
                vy: 2,
                width: 12,
                height: 12,
                type: type
            });

            this.shootCooldown = 60;
        }
    }

    draw() {
        const x = this.x;
        const y = this.y;
        const centerX = x + this.width / 2;

        defenderCtx.fillStyle = '#0099ff';

        // Body (larger)
        defenderCtx.beginPath();
        defenderCtx.arc(centerX, y + 12, 10, 0, Math.PI * 2);
        defenderCtx.fill();

        // Body outline
        defenderCtx.strokeStyle = '#00ffff';
        defenderCtx.lineWidth = 1.5;
        defenderCtx.beginPath();
        defenderCtx.arc(centerX, y + 12, 10, 0, Math.PI * 2);
        defenderCtx.stroke();

        // Head
        defenderCtx.fillStyle = '#0099ff';
        defenderCtx.beginPath();
        defenderCtx.arc(centerX, y + 3, 7, 0, Math.PI * 2);
        defenderCtx.fill();

        // Head outline
        defenderCtx.strokeStyle = '#00ffff';
        defenderCtx.lineWidth = 1.5;
        defenderCtx.beginPath();
        defenderCtx.arc(centerX, y + 3, 7, 0, Math.PI * 2);
        defenderCtx.stroke();

        // Eyes (white)
        defenderCtx.fillStyle = '#fff';
        defenderCtx.beginPath();
        defenderCtx.arc(centerX - 3, y + 1, 2, 0, Math.PI * 2);
        defenderCtx.fill();
        defenderCtx.beginPath();
        defenderCtx.arc(centerX + 3, y + 1, 2, 0, Math.PI * 2);
        defenderCtx.fill();

        // Pupils
        defenderCtx.fillStyle = '#000';
        defenderCtx.beginPath();
        defenderCtx.arc(centerX - 3, y + 1, 1, 0, Math.PI * 2);
        defenderCtx.fill();
        defenderCtx.beginPath();
        defenderCtx.arc(centerX + 3, y + 1, 1, 0, Math.PI * 2);
        defenderCtx.fill();

        // Mouth line
        defenderCtx.strokeStyle = '#000';
        defenderCtx.lineWidth = 1;
        defenderCtx.beginPath();
        defenderCtx.moveTo(centerX - 3, y + 5);
        defenderCtx.lineTo(centerX + 3, y + 5);
        defenderCtx.stroke();

        // Antennae
        defenderCtx.strokeStyle = '#0099ff';
        defenderCtx.lineWidth = 1.5;
        defenderCtx.beginPath();
        defenderCtx.moveTo(centerX - 3, y - 5);
        defenderCtx.lineTo(centerX - 4, y - 10);
        defenderCtx.stroke();
        defenderCtx.beginPath();
        defenderCtx.moveTo(centerX + 3, y - 5);
        defenderCtx.lineTo(centerX + 4, y - 10);
        defenderCtx.stroke();

        // Antenna tips
        defenderCtx.fillStyle = '#00ffff';
        defenderCtx.beginPath();
        defenderCtx.arc(centerX - 4, y - 10, 1.5, 0, Math.PI * 2);
        defenderCtx.fill();
        defenderCtx.beginPath();
        defenderCtx.arc(centerX + 4, y - 10, 1.5, 0, Math.PI * 2);
        defenderCtx.fill();
    }
}

function updateDefenderPlayer() {
    const keys = {};

    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        defenderPlayer.dx = -defenderPlayer.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        defenderPlayer.dx = defenderPlayer.speed;
    } else {
        defenderPlayer.dx = 0;
    }

    defenderPlayer.x += defenderPlayer.dx;

    if (defenderPlayer.x < 0) defenderPlayer.x = 0;
    if (defenderPlayer.x + defenderPlayer.width > defenderCanvas.width)
        defenderPlayer.x = defenderCanvas.width - defenderPlayer.width;
}

function drawDefenderPlayer() {
    const x = defenderPlayer.x;
    const y = defenderPlayer.y;
    const centerX = x + defenderPlayer.width / 2;

    // Main body (big oval) - bright green
    defenderCtx.fillStyle = '#00ff00';
    defenderCtx.beginPath();
    defenderCtx.ellipse(centerX, y + 30, 25, 28, 0, 0, Math.PI * 2);
    defenderCtx.fill();

    // Body glow effect
    defenderCtx.strokeStyle = '#00ffff';
    defenderCtx.lineWidth = 2;
    defenderCtx.beginPath();
    defenderCtx.ellipse(centerX, y + 30, 25, 28, 0, 0, Math.PI * 2);
    defenderCtx.stroke();

    // Head
    defenderCtx.fillStyle = '#00ff00';
    defenderCtx.beginPath();
    defenderCtx.arc(centerX, y + 10, 15, 0, Math.PI * 2);
    defenderCtx.fill();

    // Head outline
    defenderCtx.strokeStyle = '#00ffff';
    defenderCtx.lineWidth = 2;
    defenderCtx.beginPath();
    defenderCtx.arc(centerX, y + 10, 15, 0, Math.PI * 2);
    defenderCtx.stroke();

    // Eyes (white with black pupils)
    defenderCtx.fillStyle = '#fff';
    defenderCtx.beginPath();
    defenderCtx.arc(centerX - 5, y + 6, 4, 0, Math.PI * 2);
    defenderCtx.fill();
    defenderCtx.beginPath();
    defenderCtx.arc(centerX + 5, y + 6, 4, 0, Math.PI * 2);
    defenderCtx.fill();

    // Pupils
    defenderCtx.fillStyle = '#000';
    defenderCtx.beginPath();
    defenderCtx.arc(centerX - 5, y + 6, 2, 0, Math.PI * 2);
    defenderCtx.fill();
    defenderCtx.beginPath();
    defenderCtx.arc(centerX + 5, y + 6, 2, 0, Math.PI * 2);
    defenderCtx.fill();

    // Smile
    defenderCtx.strokeStyle = '#000';
    defenderCtx.lineWidth = 2.5;
    defenderCtx.beginPath();
    defenderCtx.arc(centerX, y + 14, 6, 0, Math.PI);
    defenderCtx.stroke();

    // Arms (darker green)
    defenderCtx.fillStyle = '#0088cc';
    defenderCtx.fillRect(x - 15, y + 20, 15, 12);
    defenderCtx.fillRect(x + defenderPlayer.width, y + 20, 15, 12);

    // Arm outlines
    defenderCtx.strokeStyle = '#00ffff';
    defenderCtx.lineWidth = 1.5;
    defenderCtx.strokeRect(x - 15, y + 20, 15, 12);
    defenderCtx.strokeRect(x + defenderPlayer.width, y + 20, 15, 12);

    // Feet (rounded)
    defenderCtx.fillStyle = '#0099ff';
    defenderCtx.beginPath();
    defenderCtx.arc(centerX - 8, y + 59, 5, 0, Math.PI * 2);
    defenderCtx.fill();
    defenderCtx.beginPath();
    defenderCtx.arc(centerX + 8, y + 59, 5, 0, Math.PI * 2);
    defenderCtx.fill();
}

function updateDefenderItems() {
    for (let i = defenderItems.length - 1; i >= 0; i--) {
        const item = defenderItems[i];
        item.x += item.vx;
        item.y += item.vy;

        // Check if out of bounds
        if (item.y > defenderCanvas.height) {
            if (item.type === 'good') {
                defenderLives--;
                if (defenderLives <= 0) {
                    endDefenderGame();
                }
            }
            defenderItems.splice(i, 1);
            continue;
        }

        // Check collision with player
        const dx = item.x - (defenderPlayer.x + defenderPlayer.width / 2);
        const dy = item.y - (defenderPlayer.y + defenderPlayer.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {
            if (item.type === 'good') {
                defenderScore += 10;
            } else {
                defenderScore = Math.max(0, defenderScore - 5);
            }

            // Create particles
            for (let j = 0; j < 8; j++) {
                const angle = (Math.PI * 2 * j) / 8;
                defenderParticles.push({
                    x: item.x,
                    y: item.y,
                    vx: Math.cos(angle) * 2,
                    vy: Math.sin(angle) * 2,
                    life: 15,
                    maxLife: 15,
                    color: item.type === 'good' ? '#ffff00' : '#ff3333'
                });
            }

            defenderItems.splice(i, 1);
        }
    }
}

function drawDefenderItems() {
    for (let item of defenderItems) {
        const x = item.x - item.width / 2;
        const y = item.y - item.height / 2;
        const centerX = item.x;
        const centerY = item.y;

        if (item.type === 'good') {
            // Positive item - Shiny star/gem
            defenderCtx.fillStyle = '#ffff00';
            defenderCtx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            defenderCtx.shadowBlur = 12;

            // Star shape
            const points = 5;
            const outerRadius = item.width / 2;
            const innerRadius = item.width / 4;

            defenderCtx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const px = centerX + Math.cos(angle) * radius;
                const py = centerY + Math.sin(angle) * radius;

                if (i === 0) {
                    defenderCtx.moveTo(px, py);
                } else {
                    defenderCtx.lineTo(px, py);
                }
            }
            defenderCtx.closePath();
            defenderCtx.fill();

            defenderCtx.shadowBlur = 0;

        } else {
            // Negative item - Spiky bomb/hazard
            defenderCtx.fillStyle = '#ff3333';
            defenderCtx.shadowColor = 'rgba(255, 51, 51, 0.8)';
            defenderCtx.shadowBlur = 10;

            // Main bomb sphere
            defenderCtx.beginPath();
            defenderCtx.arc(centerX, centerY, item.width / 2, 0, Math.PI * 2);
            defenderCtx.fill();

            // Spikes
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const x1 = centerX + Math.cos(angle) * (item.width / 2);
                const y1 = centerY + Math.sin(angle) * (item.width / 2);
                const x2 = centerX + Math.cos(angle) * (item.width / 2 + 3);
                const y2 = centerY + Math.sin(angle) * (item.width / 2 + 3);

                defenderCtx.fillRect(x2 - 1, y2 - 1, 2, 2);
            }

            defenderCtx.shadowBlur = 0;
        }
    }
}

function updateDefenderEnemies() {
    for (let enemy of defenderEnemies) {
        enemy.update();
    }
}

function drawDefenderEnemies() {
    for (let enemy of defenderEnemies) {
        enemy.draw();
    }
}

function updateDefenderParticles() {
    for (let i = defenderParticles.length - 1; i >= 0; i--) {
        const p = defenderParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;

        if (p.life <= 0) {
            defenderParticles.splice(i, 1);
        }
    }
}

function drawDefenderParticles() {
    for (let p of defenderParticles) {
        const alpha = p.life / p.maxLife;
        defenderCtx.globalAlpha = alpha;
        defenderCtx.fillStyle = p.color;
        defenderCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
        defenderCtx.globalAlpha = 1;
    }
}

function createDefenderWave() {
    defenderEnemies = [];
    const count = 2 + Math.floor(defenderLevel / 2);

    for (let i = 0; i < count; i++) {
        const x = Math.random() * (defenderCanvas.width - 40) + 20;
        const y = Math.random() * 150 + 30;
        defenderEnemies.push(new DefenderEnemy(x, y));
    }
}

function updateDefender() {
    if (!defenderGameRunning) return;

    updateDefenderPlayer();
    updateDefenderItems();
    updateDefenderEnemies();
    updateDefenderParticles();

    document.getElementById('score').textContent = defenderScore;
    document.getElementById('lives').textContent = defenderLives;
    document.getElementById('level').textContent = defenderLevel;

    // Level up progression
    if (defenderScore > 0 && defenderScore % 100 === 0 && defenderScore / 100 > defenderLevel) {
        defenderLevel++;
        createDefenderWave();
    }
}

function drawDefender() {
    // Sky gradient
    const gradient = defenderCtx.createLinearGradient(0, 0, 0, defenderCanvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    defenderCtx.fillStyle = gradient;
    defenderCtx.fillRect(0, 0, defenderCanvas.width, defenderCanvas.height);

    // Clouds
    defenderCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = (defenderAnimationFrame * 0.3 + i * 200) % (defenderCanvas.width + 100);
        defenderCtx.beginPath();
        defenderCtx.arc(x, 80 + i * 40, 30, 0, Math.PI * 2);
        defenderCtx.fill();
        defenderCtx.beginPath();
        defenderCtx.arc(x + 40, 80 + i * 40, 35, 0, Math.PI * 2);
        defenderCtx.fill();
    }

    drawDefenderPlayer();
    drawDefenderItems();
    drawDefenderEnemies();
    drawDefenderParticles();
}

function endDefenderGame() {
    defenderGameRunning = false;
    document.getElementById('finalScore').textContent = defenderScore;
    document.getElementById('gameOver').style.display = 'block';
}

function resetDefenderGame() {
    defenderScore = 0;
    defenderLives = 3;
    defenderLevel = 1;
    defenderGameRunning = true;
    defenderAnimationFrame = 0;
    defenderLastFrameTime = 0;
    defenderEnemies = [];
    defenderItems = [];
    defenderParticles = [];
    defenderPlayer.x = defenderCanvas.width / 2 - 30;
    document.getElementById('gameOver').style.display = 'none';
    createDefenderWave();
    drawDefender();
}

function defenderGameLoop(currentTime) {
    if (defenderCanvas) {
        if (defenderLastFrameTime === 0) {
            defenderLastFrameTime = currentTime;
        }

        const deltaTime = currentTime - defenderLastFrameTime;

        if (deltaTime >= DEFENDER_FRAME_DELAY) {
            updateDefender();
            drawDefender();
            defenderAnimationFrame++;
            defenderLastFrameTime = currentTime;
        }
    }

    requestAnimationFrame(defenderGameLoop);
}

requestAnimationFrame(defenderGameLoop);

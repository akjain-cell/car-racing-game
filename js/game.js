// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Game state
let game = {
    running: false,
    score: 0,
    lives: 3,
    speed: 3,
    obstacles: [],
    lastObstacleTime: 0,
    obstacleInterval: 1500
};

// Player car
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 80,
    speed: 5,
    color: '#3498db'
};

// Obstacle cars
class Obstacle {
    constructor() {
        this.width = 50;
        this.height = 80;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = game.speed;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add details to the car
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 15);
        ctx.fillRect(this.x + 5, this.y + this.height - 25, this.width - 10, 15);
    }
}

// Draw road markings
function drawRoad() {
    ctx.fillStyle = '#fff';
    const laneWidth = canvas.width / 4;
    
    // Draw center line
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 5, i, 10, 20);
    }
    
    // Draw side lines
    ctx.fillRect(laneWidth - 5, 0, 10, canvas.height);
    ctx.fillRect(canvas.width - laneWidth - 5, 0, 10, canvas.height);
}

// Draw player car
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Add details to the car
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 15);
    ctx.fillRect(player.x + 5, player.y + player.height - 25, player.width - 10, 15);
    
    // Add windows
    ctx.fillStyle = '#aed6f1';
    ctx.fillRect(player.x + 10, player.y + 30, player.width - 20, 20);
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update game state
function update() {
    if (!game.running) return;
    
    // Move obstacles
    game.obstacles.forEach((obstacle, index) => {
        obstacle.update();
        
        // Check if obstacle is out of bounds
        if (obstacle.y > canvas.height) {
            game.obstacles.splice(index, 1);
            game.score += 10;
            scoreElement.textContent = game.score;
        }
        
        // Check collision with player
        if (checkCollision(player, obstacle)) {
            game.obstacles.splice(index, 1);
            game.lives--;
            livesElement.textContent = game.lives;
            
            if (game.lives <= 0) {
                gameOver();
            }
        }
    });
    
    // Add new obstacles
    const currentTime = Date.now();
    if (currentTime - game.lastObstacleTime > game.obstacleInterval) {
        game.obstacles.push(new Obstacle());
        game.lastObstacleTime = currentTime;
        
        // Increase difficulty
        if (game.score > 0 && game.score % 100 === 0) {
            game.speed += 0.5;
            if (game.obstacleInterval > 500) {
                game.obstacleInterval -= 100;
            }
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    drawRoad();
    
    // Draw obstacles
    game.obstacles.forEach(obstacle => obstacle.draw());
    
    // Draw player
    drawPlayer();
}

// Game loop
function gameLoop() {
    update();
    draw();
    if (game.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    if (!game.running) {
        game.running = true;
        game.score = 0;
        game.lives = 3;
        game.speed = 3;
        game.obstacles = [];
        game.obstacleInterval = 1500;
        
        scoreElement.textContent = game.score;
        livesElement.textContent = game.lives;
        
        player.x = canvas.width / 2 - player.width / 2;
        
        gameLoop();
    }
}

// Pause game
function pauseGame() {
    game.running = !game.running;
    if (game.running) {
        gameLoop();
        pauseBtn.textContent = 'Pause';
    } else {
        pauseBtn.textContent = 'Resume';
    }
}

// Game over
function gameOver() {
    game.running = false;
    alert(`Game Over! Your final score: ${game.score}`);
}

// Event listeners for keyboard controls
document.addEventListener('keydown', (e) => {
    if (!game.running) return;
    
    if (e.key === 'ArrowLeft' && player.x > canvas.width / 4) {
        player.x -= player.speed;
    } else if (e.key === 'ArrowRight' && player.x < canvas.width - canvas.width / 4 - player.width) {
        player.x += player.speed;
    }
});

// Button event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);

// Initial draw
draw();
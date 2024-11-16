let score = 0;
let speed = 5;
let tileFrequency = 800;
let previousColumn = null;
let freezeActive = false;
let tiles = [];  // Array to track active tiles

function updateScore() {
    document.getElementById("score").innerText = `Score: ${score}`;
}

function gameOver() {
    alert("Game Over!");
    location.reload();  // Reload the game (for simplicity)
}

// Function to handle Freeze effect
function activateFreeze() {
    freezeActive = true;
    setTimeout(() => (freezeActive = false), 3000);  // Freeze for 3 seconds
}

// Create a tile with a specific type
function createTile(column, type = "regular") {
    const tile = document.createElement("div");
    tile.classList.add("tile", type);
    tile.style.top = "-100px";
    tile.clickable = false;  // Mark tile as initially unclickable

    // Add tile to the column and track it in the tiles array
    document.getElementById(column).appendChild(tile);
    tiles.push(tile);

    // Move tile downward
    const moveTile = setInterval(() => {
        const currentTop = parseInt(tile.style.top);
        tile.style.top = currentTop + (freezeActive ? 1 : speed) + "px";

        // If tile reaches the bottom without being clicked, game over
        if (currentTop > 500) {
            clearInterval(moveTile);
            gameOver();
        }
    }, 50);

    // Allow only the closest tile to be clicked
    tile.addEventListener("click", () => {
        if (tile === tiles[0]) {  // Only clickable if it's the first in the array
            clearInterval(moveTile);
            tile.remove();
            tiles.shift();  // Remove the tile from tracking array
            if (type === "regular") {
                score += 10;
            } else if (type === "freeze") {
                activateFreeze();
            } else if (type === "trap") {
                score -= 5;
            }
            updateScore();
        }
    });
}

// Generate tiles with a chance for special tiles
function generateTile() {
    const columns = ["col1", "col2", "col3"];
    let randomColumn;

    // Avoid consecutive tiles in the same column
    do {
        randomColumn = columns[Math.floor(Math.random() * columns.length)];
    } while (randomColumn === previousColumn);

    previousColumn = randomColumn;

    // 10% chance for special tiles
    const randomType = Math.random() < 0.1 ? (Math.random() < 0.5 ? "freeze" : "trap") : "regular";
    createTile(randomColumn, randomType);
}

// Start game with tile generation and difficulty increase
function startGame() {
    updateScore();

    // Tile generation interval
    setInterval(() => {
        generateTile();
    }, tileFrequency);

    // Gradual increase in difficulty
    setInterval(() => {
        speed += 0.5;
        tileFrequency = Math.max(200, tileFrequency - 10);
    }, 5000);
}

startGame();

// This is for the background music and tile sync

const audioElement = document.getElementById("bg-music");
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioContext.createMediaElementSource(audioElement);
const analyser = audioContext.createAnalyser();
audioSource.connect(analyser);
analyser.connect(audioContext.destination);

// Function to start music and analyze the beat
function startMusic() {
    audioElement.play();
    detectBeats();
    
}

// Simple beat detection based on audio frequency
function detectBeats() {
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    setInterval(() => {
        analyser.getByteFrequencyData(dataArray);

        // Basic beat detection
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

        // Adjust threshold for sensitivity
        if (average > 50) {
            generateTile();  // Generate a tile on detected beat
        }
    }, 100);  // Check rhythm every 100 ms
}

// Call startMusic to begin
audioElement.addEventListener("canplay", startMusic);



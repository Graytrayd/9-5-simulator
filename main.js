const video = document.getElementById('intro-video');
const cutsceneContainer = document.getElementById('cutscene-container');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const gameTitle = document.getElementById('game-title');
const tickerBox = document.getElementById('ticker-box');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const posInterface = document.getElementById('pos-interface');
const videoOverlay = document.getElementById('video-overlay');
const gameplayVideo = document.getElementById('gameplay-video');
const friesVideo = document.getElementById('fries-video');
const refuseOverlay = document.getElementById('refuse-overlay');
const refuseVideo = document.getElementById('refuse-video');
const acceptAudio = document.getElementById('accept-audio');
const declineOverlay = document.getElementById('decline-overlay');
const declineVideo = document.getElementById('decline-video');
const friesRefuseOverlay = document.getElementById('fries-refuse-overlay');
const friesRefuseVideo = document.getElementById('fries-refuse-video');
const endScreen = document.getElementById('end-screen');
const btnPlayAgain = document.getElementById('btn-play-again');
const refuseButtons = document.getElementById('refuse-buttons');
const btnAcceptRefuse = document.getElementById('btn-accept-refuse');
const btnDeclineRefuse = document.getElementById('btn-decline-refuse');
const btnTake = document.getElementById('btn-take');
const btnRefuse = document.getElementById('btn-refuse');
const orderText = document.querySelector('.order-text');

let currentOrder = 'BIG_MACS'; // Track which order we are on

// Browser policy often prevents autoplay with sound, so we use a button to start
startBtn.addEventListener('click', () => {
    // Try to go fullscreen for the whole experience
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log("Fullscreen denied", e));
    }

    startBtn.style.display = 'none';
    gameTitle.style.display = 'none'; // Hide title when video starts
    tickerBox.style.display = 'none'; // Hide ticker
    cutsceneContainer.style.background = 'black'; // Remove background image
    video.style.display = 'block'; // Show video
    video.play().catch(e => {
        console.error("Video play failed", e);
        startGame(); // Fallback if video fails
    });
});

// When video ends, start the game
video.addEventListener('ended', () => {
    startGame();
});

// Optional: Allow skipping with Space
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && cutsceneContainer.style.display !== 'none') {
        video.pause();
        startGame();
    }
});

function startGame() {
    cutsceneContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Resize canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize Game Loop
    console.log("Game Started");
    
    // Draw McDonald's POS Background
    drawPOSBackground();

    // Show the UI
    posInterface.style.display = 'flex';
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gameContainer.style.display === 'block') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawPOSBackground();
    }
});

// Button Event Listeners
btnTake.addEventListener('click', () => {
    // Hide Game UI
    gameContainer.style.display = 'none';
    
    // Show Video Overlay
    videoOverlay.style.display = 'flex';
    
    let videoToPlay;

    if (currentOrder === 'BIG_MACS') {
        videoToPlay = gameplayVideo;
        gameplayVideo.style.display = 'block';
        friesVideo.style.display = 'none';
    } else if (currentOrder === 'FRIES') {
        videoToPlay = friesVideo;
        friesVideo.style.display = 'block';
        gameplayVideo.style.display = 'none';
    }

    videoToPlay.currentTime = 0; // Reset video to start
    
    // Force a layout reflow to ensure the element is visible before playing
    void videoToPlay.offsetWidth; 

    videoToPlay.play().then(() => {
        // Request Fullscreen for the video element AFTER play starts
        if (videoToPlay.requestFullscreen) {
            videoToPlay.requestFullscreen();
        } else if (videoToPlay.webkitRequestFullscreen) { /* Safari */
            videoToPlay.webkitRequestFullscreen();
        } else if (videoToPlay.msRequestFullscreen) { /* IE11 */
            videoToPlay.msRequestFullscreen();
        }
    }).catch(e => console.error("Error playing video:", e));
});

function startRefuseSequence() {
    // Hide Game UI & Decline Overlay
    gameContainer.style.display = 'none';
    declineOverlay.style.display = 'none';
    
    // Show Refuse Video Overlay
    refuseOverlay.style.display = 'flex';
    refuseVideo.currentTime = 0;
    refuseButtons.style.display = 'none'; // Hide buttons initially

    // Play Video
    refuseVideo.play().then(() => {
        // Request Fullscreen
        if (refuseVideo.requestFullscreen) {
            refuseVideo.requestFullscreen();
        }
    }).catch(e => console.error("Error playing refuse video:", e));

    // Show buttons after 4 seconds
    setTimeout(() => {
        refuseButtons.style.display = 'flex';
        // Exit fullscreen so buttons are clickable/visible
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log("Exit fullscreen failed", e));
        }
    }, 4000);
}

function startFriesRefuseSequence() {
    // Hide Game UI
    gameContainer.style.display = 'none';
    
    // Show Fries Refuse Overlay
    friesRefuseOverlay.style.display = 'flex';
    friesRefuseVideo.currentTime = 0;

    // Play Video
    friesRefuseVideo.play().then(() => {
        if (friesRefuseVideo.requestFullscreen) {
            friesRefuseVideo.requestFullscreen();
        }
    }).catch(e => console.error("Error playing fries refuse video:", e));
}

btnRefuse.addEventListener('click', () => {
    if (currentOrder === 'FRIES') {
        startFriesRefuseSequence();
    } else {
        startRefuseSequence();
    }
});

btnAcceptRefuse.addEventListener('click', () => {
    console.log("Refuse -> Accepted");
    // Hide buttons
    refuseButtons.style.display = 'none';
    
    // Play the audio from the other video file
    acceptAudio.currentTime = 0;
    acceptAudio.play().catch(e => console.error("Error playing accept audio:", e));
    
    // Keep the current video visible (it might be paused or finished, depending on length)
    // If you want it to loop or stay on the last frame, it will do so naturally if paused/ended.
});

// When the accept audio finishes, go back to gameplay with new order
acceptAudio.addEventListener('ended', () => {
    refuseOverlay.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Update Order
    currentOrder = 'FRIES';
    orderText.textContent = "French Fries";
    
    // Ensure POS is visible
    posInterface.style.display = 'flex';
    drawPOSBackground();
});

btnDeclineRefuse.addEventListener('click', () => {
    console.log("Refuse -> Declined");
    
    // Hide Refuse Overlay
    refuseOverlay.style.display = 'none';
    
    // Show Decline Overlay
    declineOverlay.style.display = 'flex';
    declineVideo.currentTime = 0;
    
    declineVideo.play().then(() => {
        if (declineVideo.requestFullscreen) {
            declineVideo.requestFullscreen();
        }
    }).catch(e => console.error("Error playing decline video:", e));
});

// When decline video ends, loop back to refuse sequence
declineVideo.addEventListener('ended', () => {
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log("Exit fullscreen failed", e));
    }
    startRefuseSequence();
});

// When the Big Mac video ends, go to French Fries order
gameplayVideo.addEventListener('ended', () => {
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log("Exit fullscreen failed", e));
    }
    
    videoOverlay.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Update Order to Fries
    currentOrder = 'FRIES';
    orderText.textContent = "French Fries";
    
    // Ensure POS is visible
    posInterface.style.display = 'flex';
    drawPOSBackground();
});

// When the Fries video ends... (Currently does nothing, maybe loop back or end game?)
friesVideo.addEventListener('ended', () => {
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log("Exit fullscreen failed", e));
    }
    
    // Hide video and show End Screen
    videoOverlay.style.display = 'none';
    endScreen.style.display = 'flex';
});

// When fries refuse video ends, go back to POS
friesRefuseVideo.addEventListener('ended', () => {
    if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log("Exit fullscreen failed", e));
    }
    friesRefuseOverlay.style.display = 'none';
    gameContainer.style.display = 'block';
});

// Play Again Button Logic
btnPlayAgain.addEventListener('click', () => {
    // Reset Game State
    endScreen.style.display = 'none';
    currentOrder = 'BIG_MACS';
    orderText.textContent = "2 Big Macs"; // Reset text
    
    // Show Start Screen
    cutsceneContainer.style.display = 'flex';
    cutsceneContainer.style.background = "black url('Screenshot 2025-11-23 154639.png') no-repeat center center";
    cutsceneContainer.style.backgroundSize = "cover";
    
    startBtn.style.display = 'block';
    gameTitle.style.display = 'block';
    tickerBox.style.display = 'block'; // Show ticker
    video.style.display = 'none';
    video.currentTime = 0;
});

function drawPOSBackground() {
    // Screen Background (Dark Grey POS style)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Bar
    ctx.fillStyle = '#c0392b'; // Red header
    ctx.fillRect(0, 0, canvas.width, 60);
    
    // Header Text
    ctx.fillStyle = '#f1c40f'; // Yellow text
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'left';
    ctx.fillText("McWagie POS v1.0", 20, 40);

    // Clock (Static for now)
    ctx.textAlign = 'right';
    ctx.fillText("09:00 AM", canvas.width - 20, 40);
}

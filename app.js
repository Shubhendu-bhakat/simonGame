// Enhanced Simon game logic (browser only). If `document` is not available (Node), skip DOM setup.
let gameSeq = [];
let userSeq = [];
let started = false;
let level = 0;
let highScore = (typeof localStorage !== 'undefined') ? (localStorage.getItem('simonHighScore') || 0) : 0;

const btns = ["yellow", "red", "purple", "green"];

if (typeof document !== 'undefined') {
  const messageEl = document.querySelector("#message");
  const levelEl = document.querySelector("#level");
  const highScoreEl = document.querySelector("#highScore");
  const timerEl = document.querySelector("#timer");

  // Initialize displays
  highScoreEl.innerText = highScore;
  function updateLevelDisplay() {
    levelEl.innerText = level === 0 ? "--" : level;
  }

  // Turn timer state
  let turnTimerInterval = null;
  let turnTimeLeft = 0;

  function computeAllowedTime(level) {
    // Base 30s; increase by 5s every 3 levels, cap at 60s
    return Math.min(60, 30 + Math.floor(level / 3) * 5);
  }

  function updateTimerDisplay() {
    if (timerEl) timerEl.innerText = turnTimeLeft > 0 ? `${turnTimeLeft}s` : "--";
  }

  function clearTurnTimer() {
    if (turnTimerInterval) {
      clearInterval(turnTimerInterval);
      turnTimerInterval = null;
    }
    turnTimeLeft = 0;
    updateTimerDisplay();
  }

  function startTurnTimer() {
    clearTurnTimer();
    turnTimeLeft = computeAllowedTime(level || 1);
    updateTimerDisplay();
    turnTimerInterval = setInterval(() => {
      turnTimeLeft -= 1;
      updateTimerDisplay();
      if (turnTimeLeft <= 0) {
        clearTurnTimer();
        // Timeout: end the game
        messageEl.innerHTML = `Time's up!`;
        setTimeout(() => endGame(), 300);
      }
    }, 1000);
  }

  document.addEventListener("keypress", () => {
    if (!started) {
      started = true;
      gameSeq = [];
      userSeq = [];
      level = 0;
      updateLevelDisplay();
      messageEl.innerText = "Watch the sequence!";
      leveUp();
    }
  });

  function btnFlash(btn) {
    btn.classList.add("flash");
    setTimeout(() => btn.classList.remove("flash"), 300);
  }

  function userFlash(btn) {
    btn.classList.add("userFlash");
    setTimeout(() => btn.classList.remove("userFlash"), 200);
  }

  function leveUp() {
    // clear any user-turn timer when computer starts sequence
    clearTurnTimer();
    userSeq = [];
    level++;
    updateLevelDisplay();
    messageEl.innerText = `Level ${level} - Watch!`;

    // Disable buttons while sequence is playing
    document.querySelectorAll(".btn").forEach(b => b.classList.add("disabled"));

    setTimeout(() => {
      const randomIndx = Math.floor(Math.random() * 4);
      const randomCol = btns[randomIndx];
      gameSeq.push(randomCol);
      playSequence();
    }, 500);
  }

  function playSequence() {
    let delay = 0;
    gameSeq.forEach((color) => {
      setTimeout(() => {
        const btn = document.querySelector(`#${color}`);
        btnFlash(btn);
      }, delay);
      delay += 500;
    });

    setTimeout(() => {
      document.querySelectorAll(".btn").forEach(b => b.classList.remove("disabled"));
      messageEl.innerText = "Your turn!";
      // Start countdown for player's response
      startTurnTimer();
    }, delay);
  }

  function checkAns(index) {
    if (userSeq[index] === gameSeq[index]) {
      if (userSeq.length === gameSeq.length) {
        setTimeout(leveUp, 1000);
      }
    } else {
      endGame();
    }
  }

  function endGame() {
    started = false;

    // clear timer if running
    clearTurnTimer();

    if (level > parseInt(highScore)) {
      highScore = level;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('simonHighScore', highScore);
      }
      highScoreEl.innerText = highScore;
      messageEl.innerHTML = `🎉 New High Score! <br><strong>${level}</strong><br>Press any key to play again`;
    } else {
      messageEl.innerHTML = `Game Over! Score: <strong>${level}</strong><br>Press any key to play again`;
    }

    document.body.classList.add("game-over");
    setTimeout(() => document.body.classList.remove("game-over"), 600);

    gameSeq = [];
    userSeq = [];
    level = 0;
    updateLevelDisplay();
  }

  function btnPress(e) {
    if (started && !this.classList.contains("disabled")) {
      const btn = this;
      userFlash(btn);
      const userColor = btn.getAttribute("id");
      userSeq.push(userColor);
      checkAns(userSeq.length - 1);
    }
  }

  document.querySelectorAll(".btn").forEach(b => b.addEventListener("click", btnPress));
}

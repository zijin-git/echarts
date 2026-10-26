(function () {
  "use strict";

  var COLS = 20;
  var ROWS = 20;
  var CELL = 20;
  var SCORE_PER_FOOD = 10;
  var BASE_INTERVAL = 150;
  var MIN_INTERVAL = 60;
  var SPEED_STEP_FOODS = 5;
  var SPEED_DELTA = 10;
  var BEST_KEY = "greedy_snake_best";

  var DIRS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 },
  };

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var statusEl = document.getElementById("status");
  var overlay = document.getElementById("overlay");
  var overlayText = document.getElementById("overlay-text");
  var btnToggle = document.getElementById("btn-toggle");
  var btnRestart = document.getElementById("btn-restart");

  var state = "ready"; // ready | running | paused | over
  var snake = [];
  var dir = { x: 1, y: 0 };
  var nextDir = { x: 1, y: 0 };
  var food = null;
  var score = 0;
  var best = 0;
  var foodsEaten = 0;
  var timer = null;

  function loadBest() {
    var raw = 0;
    try {
      raw = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
    } catch (e) {
      raw = 0;
    }
    best = isNaN(raw) ? 0 : raw;
    bestEl.textContent = String(best);
  }

  function saveBest() {
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch (e) {
        /* ignore */
      }
    }
  }

  function intervalMs() {
    var steps = Math.floor(foodsEaten / SPEED_STEP_FOODS);
    return Math.max(MIN_INTERVAL, BASE_INTERVAL - steps * SPEED_DELTA);
  }

  function resetGame() {
    stopLoop();
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    foodsEaten = 0;
    scoreEl.textContent = "0";
    placeFood();
    setState("ready", "按空格或点击开始");
    draw();
  }

  function setState(next, message) {
    state = next;
    var labels = {
      ready: "就绪",
      running: "进行中",
      paused: "暂停",
      over: "结束",
    };
    statusEl.textContent = labels[next] || next;
    btnToggle.textContent = next === "running" ? "暂停" : next === "paused" ? "继续" : "开始";

    if (next === "running") {
      overlay.classList.add("hidden");
    } else {
      overlay.classList.remove("hidden");
      overlayText.textContent = message || "";
    }
  }

  function placeFood() {
    var occupied = {};
    for (var i = 0; i < snake.length; i++) {
      occupied[snake[i].x + "," + snake[i].y] = true;
    }
    var free = [];
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (!occupied[x + "," + y]) free.push({ x: x, y: y });
      }
    }
    if (!free.length) {
      food = null;
      return;
    }
    food = free[Math.floor(Math.random() * free.length)];
  }

  function opposite(a, b) {
    return a.x + b.x === 0 && a.y + b.y === 0;
  }

  function queueDir(d) {
    if (!d) return;
    if (opposite(d, dir)) return;
    nextDir = d;
  }

  function tick() {
    if (state !== "running") return;
    dir = nextDir;
    var head = snake[0];
    var nx = head.x + dir.x;
    var ny = head.y + dir.y;

    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) {
      gameOver();
      return;
    }

    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === nx && snake[i].y === ny) {
        gameOver();
        return;
      }
    }

    snake.unshift({ x: nx, y: ny });

    if (food && nx === food.x && ny === food.y) {
      score += SCORE_PER_FOOD;
      foodsEaten += 1;
      scoreEl.textContent = String(score);
      saveBest();
      placeFood();
      restartLoop();
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    stopLoop();
    saveBest();
    setState("over", "游戏结束 · 得分 " + score + " · 按 R 或点击重新开始");
    draw();
  }

  function startLoop() {
    stopLoop();
    timer = setInterval(tick, intervalMs());
  }

  function restartLoop() {
    if (state === "running") startLoop();
  }

  function stopLoop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function togglePlay() {
    if (state === "ready") {
      setState("running");
      startLoop();
      return;
    }
    if (state === "running") {
      stopLoop();
      setState("paused", "已暂停 · 空格或点击继续");
      return;
    }
    if (state === "paused") {
      setState("running");
      startLoop();
      return;
    }
    if (state === "over") {
      overlayText.textContent = "请先重新开始";
    }
  }

  function drawCell(x, y, color, inset) {
    var pad = inset || 1;
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + pad, y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
  }

  function draw() {
    ctx.fillStyle = "#102820";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(62, 207, 142, 0.08)";
    ctx.lineWidth = 1;
    for (var i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, canvas.height);
      ctx.stroke();
    }
    for (var j = 0; j <= ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * CELL + 0.5);
      ctx.lineTo(canvas.width, j * CELL + 0.5);
      ctx.stroke();
    }

    if (food) {
      drawCell(food.x, food.y, "#ff7a59", 3);
    }

    for (var k = snake.length - 1; k >= 0; k--) {
      var seg = snake[k];
      drawCell(seg.x, seg.y, k === 0 ? "#b8ffe0" : "#5dffb0", k === 0 ? 2 : 3);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      togglePlay();
      return;
    }
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      resetGame();
      return;
    }
    if (DIRS[e.key]) {
      e.preventDefault();
      if (state === "ready") {
        setState("running");
        startLoop();
      }
      if (state === "running" || state === "paused") {
        queueDir(DIRS[e.key]);
      }
    }
  });

  btnToggle.addEventListener("click", togglePlay);
  btnRestart.addEventListener("click", resetGame);

  loadBest();
  resetGame();
})();

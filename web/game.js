/**
 * Side-profile free throw: Space = start power meter, Space again = shoot.
 */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const msgEl = document.getElementById("msg");

const W = canvas.width;
const H = canvas.height;

const floorY = H - 42;
const gravity = 2200;
const ballR = 11;

const player = {
  footX: 130,
  footY: floorY,
  height: 118,
};

const release = {
  x: player.footX + 28,
  y: floorY - player.height + 24,
};

const hoop = {
  x: 718,
  backboardX: 688,
  backboardTop: floorY - 248,
  backboardH: 118,
  rimY: floorY - 212,
  rimHalfW: 38,
};

let score = 0;
let state = "ready"; // ready | charging | flying | settled

let ball = { x: release.x, y: release.y, vx: 0, vy: 0, rot: 0 };

let powerPhase = 0;
const powerSpeed = 2.8;

let lastTs = 0;
let settledTimer = 0;

function powerValue() {
  return (Math.sin(powerPhase) + 1) * 0.5;
}

function minMaxSpeed() {
  return { min: 420, max: 920 };
}

function shoot(power) {
  const { min, max } = minMaxSpeed();
  const speed = min + power * (max - min);
  const aimX = hoop.x;
  const aimY = hoop.rimY - 4;
  const dx = aimX - release.x;
  const dy = aimY - release.y;
  const len = Math.hypot(dx, dy) || 1;
  ball.x = release.x;
  ball.y = release.y;
  ball.vx = (dx / len) * speed;
  ball.vy = (dy / len) * speed;
  ball.rot = 0;
  state = "flying";
  msgEl.textContent = "";
  msgEl.className = "msg";
}

function resetBall() {
  ball = { x: release.x, y: release.y, vx: 0, vy: 0, rot: 0 };
  state = "ready";
  msgEl.textContent = "";
  msgEl.className = "msg";
}

function onKeyDown(e) {
  if (e.code !== "Space") return;
  e.preventDefault();

  if (state === "ready") {
    state = "charging";
    powerPhase = 0;
    return;
  }
  if (state === "charging") {
    const p = powerValue();
    shoot(p);
    return;
  }
  if (state === "settled") {
    resetBall();
  }
}

window.addEventListener("keydown", onKeyDown);

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, floorY);
  g.addColorStop(0, "#6eb8e8");
  g.addColorStop(0.55, "#9fd4f0");
  g.addColorStop(1, "#b8dfe8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, floorY);
}

function drawFloor() {
  ctx.fillStyle = "#c67b4e";
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x + 20, H);
    ctx.stroke();
  }
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(W, floorY);
  ctx.stroke();
}

function drawHoopSide() {
  const { backboardX, backboardTop, backboardH, rimY, rimHalfW, x: poleTopX } = hoop;
  ctx.fillStyle = "#2d3748";
  ctx.fillRect(backboardX - 6, backboardTop, 12, backboardH);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(backboardX - 4, backboardTop + 8, 8, backboardH - 16);

  ctx.strokeStyle = "#4a5568";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(poleTopX - 6, floorY);
  ctx.lineTo(poleTopX - 6, backboardTop + backboardH);
  ctx.stroke();

  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(backboardX + 8, rimY);
  ctx.lineTo(backboardX + 8 + rimHalfW, rimY + 6);
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(backboardX + 8 + rimHalfW, rimY + 6, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(backboardX + 14, rimY + 18);
  ctx.lineTo(backboardX + 14 + rimHalfW - 10, rimY + 70);
  ctx.stroke();
}

function drawPlayer() {
  const fx = player.footX;
  const fy = player.footY;
  const h = player.height;

  ctx.save();
  ctx.translate(fx, fy);
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.ellipse(18, -8, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2d4a6f";
  ctx.fillRect(12, -h * 0.45, 20, h * 0.42);

  ctx.fillStyle = "#e8c4a0";
  ctx.beginPath();
  ctx.arc(22, -h + 18, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(28, -h * 0.35);
  ctx.lineTo(48, -h * 0.15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(22, -h * 0.2);
  ctx.lineTo(22, -h * 0.05);
  ctx.stroke();

  ctx.restore();
}

function drawPowerMeter() {
  if (state !== "charging") return;

  const cx = release.x;
  const baseY = release.y + 36;
  const maxLen = 100;
  const p = powerValue();
  const len = 12 + p * maxLen;

  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx + maxLen + 12, baseY);
  ctx.stroke();

  const hue = 120 - p * 120;
  ctx.strokeStyle = `hsl(${hue}, 85%, 52%)`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.lineTo(cx + len, baseY);
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.fillText("POWER", cx - 2, baseY - 10);
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rot);
  const g = ctx.createRadialGradient(-4, -4, 2, 0, 0, ballR);
  g.addColorStop(0, "#fff3e0");
  g.addColorStop(0.45, "#f59e0b");
  g.addColorStop(1, "#b45309");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, ballR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function stepBall(dt, prevX) {
  ball.vy += gravity * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.rot += ((ball.vx * dt) / ballR) * 0.9;

  const bb = hoop.backboardX;
  if (
    ball.x + ballR > bb - 2 &&
    prevX + ballR <= bb - 2 &&
    ball.y > hoop.backboardTop + 10 &&
    ball.y < hoop.backboardTop + hoop.backboardH - 10
  ) {
    ball.x = bb - 2 - ballR;
    ball.vx *= -0.45;
  }

  const rimL = hoop.backboardX + 8;
  const rimR = rimL + hoop.rimHalfW;
  const rimCy = hoop.rimY + 6;

  if (ball.y + ballR > rimCy - 3 && ball.y - ballR < rimCy + 10) {
    if (ball.x > rimL - 4 && ball.x < rimR + 8 && ball.vy > 0) {
      if (ball.x < rimL + 8 || ball.x > rimR - 4) {
        ball.vy *= -0.35;
        ball.vx += (Math.random() - 0.5) * 120;
      }
    }
  }

  if (ball.y + ballR > floorY) {
    ball.y = floorY - ballR;
    ball.vy *= -0.55;
    ball.vx *= 0.88;
    if (Math.abs(ball.vy) < 140) ball.vy = 0;
    if (Math.abs(ball.vx) < 40) ball.vx = 0;
  }

  if (ball.x - ballR < 0) {
    ball.x = ballR;
    ball.vx *= -0.6;
  }
  if (ball.x + ballR > W) {
    ball.x = W - ballR;
    ball.vx *= -0.6;
  }

  const crossX = hoop.x - 4;
  if (prevX < crossX && ball.x >= crossX && ball.vy > 40) {
    const dy = Math.abs(ball.y - hoop.rimY);
    if (dy < 24) {
      score += 1;
      scoreEl.textContent = `Score: ${score}`;
      msgEl.textContent = "Nothing but net!";
      msgEl.className = "msg hit";
      ball.vx = 0;
      ball.vy = 0;
      state = "settled";
      settledTimer = 0;
      return;
    }
  }

  const speed2 = ball.vx * ball.vx + ball.vy * ball.vy;
  if (speed2 < 900 && ball.y >= floorY - ballR - 2) {
    settledTimer += dt;
    if (settledTimer > 0.45) {
      state = "settled";
      msgEl.textContent = msgEl.textContent || "Miss — Space to try again";
      msgEl.className = "msg miss";
      settledTimer = 0;
    }
  } else {
    settledTimer = 0;
  }
}

function frame(ts) {
  if (!lastTs) lastTs = ts;
  const dt = Math.min(0.033, (ts - lastTs) / 1000);
  lastTs = ts;

  if (state === "charging") {
    powerPhase += powerSpeed * dt * Math.PI * 2;
  }

  if (state === "flying") {
    const px = ball.x;
    const py = ball.y;
    stepBall(dt, px);
  }

  drawSky();
  drawFloor();
  drawHoopSide();
  drawPlayer();

  if (state === "ready" || state === "charging") {
    ball.x = release.x;
    ball.y = release.y;
    ball.vx = 0;
    ball.vy = 0;
  }

  drawBall();
  drawPowerMeter();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

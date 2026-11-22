window.People = (function() {
  let player = {
    x: 400,
    y: 400,
    angle: 0,
    speed: 3.5,
    sprintMultiplier: 1.8,
    stamina: 100,
    maxStamina: 100,
    health: 100,
    maxHealth: 100,
    money: 250
  };

  let pedestrians = [];

  function init() {
    player.x = 400;
    player.y = 400;
    player.health = 100;
    player.stamina = 100;
    player.money = 250;

    pedestrians = [];
    for (let i = 0; i < 20; i++) {
      pedestrians.push({
        x: 200 + Math.random() * 2800,
        y: 200 + Math.random() * 3200,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color: ['#f43f5e', '#38bdf8', '#facc15', '#4ade80'][Math.floor(Math.random() * 4)]
      });
    }
  }

  function update(keys, inCar) {
    if (!inCar) {
      let dx = 0;
      let dy = 0;
      let isSprinting = false;

      if (keys['w'] || keys['ArrowUp']) dy -= 1;
      if (keys['s'] || keys['ArrowDown']) dy += 1;
      if (keys['a'] || keys['ArrowLeft']) dx -= 1;
      if (keys['d'] || keys['ArrowRight']) dx += 1;

      if ((dx !== 0 || dy !== 0) && keys['Shift'] && player.stamina > 5) {
        isSprinting = true;
        player.stamina = Math.max(0, player.stamina - 0.6);
      } else {
        player.stamina = Math.min(player.maxStamina, player.stamina + 0.3);
      }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      let currentSpeed = player.speed * (isSprinting ? player.sprintMultiplier : 1);
      let nextX = player.x + dx * currentSpeed;
      let nextY = player.y + dy * currentSpeed;

      if (!City.checkCollision(nextX, player.y, 14)) {
        player.x = nextX;
      }
      if (!City.checkCollision(player.x, nextY, 14)) {
        player.y = nextY;
      }

      if (dx !== 0 || dy !== 0) {
        player.angle = Math.atan2(dy, dx);
      }
    }

    // Update pedestrians
    for (let i = 0; i < pedestrians.length; i++) {
      let p = pedestrians[i];
      p.x += p.vx;
      p.y += p.vy;
      if (City.checkCollision(p.x, p.y, 10)) {
        p.vx = -p.vx;
        p.vy = -p.vy;
      }
    }
  }

  function render(ctx, camera, inCar) {
    // Render pedestrians
    for (let i = 0; i < pedestrians.length; i++) {
      const p = pedestrians[i];
      ctx.save();
      ctx.translate(p.x - camera.x + ctx.canvas.width / 2, p.y - camera.y + ctx.canvas.height / 2);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render player on foot if not in car
    if (!inCar) {
      ctx.save();
      ctx.translate(player.x - camera.x + ctx.canvas.width / 2, player.y - camera.y + ctx.canvas.height / 2);
      ctx.rotate(player.angle);

      // Body
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Head / facing direction indicator
      ctx.fillStyle = '#fff';
      ctx.fillRect(4, -4, 8, 8);

      ctx.restore();
    }
  }

  init();

  return {
    getPlayer: () => player,
    update,
    render,
    reset: init
  };
})();

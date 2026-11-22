window.Police = (function() {
  let wantedStars = 0;
  let policeCars = [];
  let sirenTimer = 0;

  function init() {
    wantedStars = 0;
    policeCars = [];
  }

  function addWanted(amount) {
    wantedStars = Math.min(5, wantedStars + amount);
    if (wantedStars > 0 && policeCars.length === 0) {
      spawnPolice();
    }
  }

  function spawnPolice() {
    policeCars = [
      { x: 600, y: 200, angle: 0, speed: 0, maxSpeed: 10, color: '#1d4ed8' },
      { x: 1400, y: 1000, angle: Math.PI / 2, speed: 0, maxSpeed: 10, color: '#1d4ed8' }
    ];
  }

  function update(targetX, targetY) {
    if (wantedStars <= 0) {
      policeCars = [];
      return;
    }

    sirenTimer++;
    if (sirenTimer % 120 === 0 && window.AudioSys) {
      window.AudioSys.playSiren();
    }

    for (let i = 0; i < policeCars.length; i++) {
      let cop = policeCars[i];
      let dx = targetX - cop.x;
      let dy = targetY - cop.y;
      let dist = Math.hypot(dx, dy);

      let targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - cop.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      cop.angle += Math.max(-0.06, Math.min(0.06, angleDiff));

      if (dist > 150) {
        cop.speed = Math.min(cop.speed + 0.25, cop.maxSpeed);
      } else {
        cop.speed = Math.max(cop.speed - 0.2, 0);
      }

      cop.x += Math.cos(cop.angle) * cop.speed;
      cop.y += Math.sin(cop.angle) * cop.speed;
    }
  }

  function render(ctx, camera) {
    if (wantedStars <= 0) return;

    for (let i = 0; i < policeCars.length; i++) {
      const cop = policeCars[i];
      ctx.save();
      ctx.translate(cop.x - camera.x + ctx.canvas.width / 2, cop.y - camera.y + ctx.canvas.height / 2);
      ctx.rotate(cop.angle);

      // Cop car body
      ctx.fillStyle = cop.color;
      ctx.fillRect(-30, -16, 60, 32);

      // Police lights (flashing red/blue)
      ctx.fillStyle = (Math.floor(Date.now() / 150) % 2 === 0) ? '#ef4444' : '#3b82f6';
      ctx.fillRect(-6, -6, 12, 12);

      ctx.restore();
    }
  }

  init();

  return {
    getWantedStars: () => wantedStars,
    setWantedStars: (stars) => { wantedStars = stars; if(stars > 0) spawnPolice(); },
    addWanted,
    update,
    render,
    reset: init
  };
})();

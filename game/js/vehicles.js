window.Vehicles = (function() {
  let cars = [];

  function init() {
    cars = [
      { x: 500, y: 500, angle: 0, speed: 0, maxSpeed: 12, accel: 0.3, steer: 0.05, color: '#e11d48', name: 'Vipera Turbo', isTraffic: false },
      { x: 1200, y: 800, angle: Math.PI / 2, speed: 2, maxSpeed: 8, accel: 0.2, steer: 0.04, color: '#38bdf8', name: 'Sunburst GT', isTraffic: true },
      { x: 1800, y: 1500, angle: 0, speed: -2, maxSpeed: 8, accel: 0.2, steer: 0.04, color: '#facc15', name: 'Coastal Cruiser', isTraffic: true },
      { x: 800, y: 2200, angle: Math.PI, speed: 3, maxSpeed: 9, accel: 0.2, steer: 0.04, color: '#4ade80', name: 'Veridia Special', isTraffic: true },
      { x: 2200, y: 600, angle: Math.PI / 2, speed: 2, maxSpeed: 8, accel: 0.2, steer: 0.04, color: '#a855f7', name: 'Palm Speedster', isTraffic: true }
    ];
  }

  function update(keys, player, activeCarIndex) {
    for (let i = 0; i < cars.length; i++) {
      let car = cars[i];
      if (car.isTraffic) {
        // Simple AI movement along grid roads
        car.x += Math.cos(car.angle) * car.speed;
        car.y += Math.sin(car.angle) * car.speed;
        if (City.checkCollision(car.x, car.y, 25)) {
          car.angle += Math.PI / 2;
          car.x += Math.cos(car.angle) * 10;
          car.y += Math.sin(car.angle) * 10;
        }
      } else if (i === activeCarIndex) {
        // Player controlled car physics
        let accelerating = false;
        if (keys['w'] || keys['ArrowUp']) {
          car.speed = Math.min(car.speed + car.accel, car.maxSpeed);
          accelerating = true;
        } else if (keys['s'] || keys['ArrowDown']) {
          car.speed = Math.max(car.speed - car.accel, -car.maxSpeed / 2);
          accelerating = true;
        } else {
          car.speed *= 0.95; // Friction
        }

        if (keys['Space']) {
          car.speed *= 0.85; // Handbrake
        }

        if (Math.abs(car.speed) > 0.5) {
          let steerDir = 0;
          if (keys['a'] || keys['ArrowLeft']) steerDir = -1;
          if (keys['d'] || keys['ArrowRight']) steerDir = 1;
          car.angle += steerDir * car.steer * (car.speed / car.maxSpeed);
        }

        let nextX = car.x + Math.cos(car.angle) * car.speed;
        let nextY = car.y + Math.sin(car.angle) * car.speed;

        if (!City.checkCollision(nextX, nextY, 25)) {
          car.x = nextX;
          car.y = nextY;
        } else {
          car.speed = -car.speed * 0.5;
          if (Math.abs(car.speed) > 2 && window.AudioSys) {
            window.AudioSys.playCrash();
          }
        }

        if (window.AudioSys) {
          window.AudioSys.updateEngine(car.speed, accelerating);
        }
      }
    }
  }

  function render(ctx, camera) {
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      ctx.save();
      ctx.translate(car.x - camera.x + ctx.canvas.width / 2, car.y - camera.y + ctx.canvas.height / 2);
      ctx.rotate(car.angle);

      // Car body
      ctx.fillStyle = car.color;
      ctx.fillRect(-30, -16, 60, 32);

      // Windshield & roof
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, -12, 24, 24);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(26, -14, 4, 6);
      ctx.fillRect(26, 8, 4, 6);

      ctx.restore();
    }
  }

  init();

  return {
    getCars: () => cars,
    update,
    render,
    reset: init
  };
})();

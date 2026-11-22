(function() {
  let canvas, ctx;
  let gameState = 'start'; // start, playing, paused, busted, wasted
  let keys = {};
  let inCar = false;
  let activeCarIndex = 0;
  let camera = { x: 400, y: 400 };

  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    HUD.init();

    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      keys[e.code] = true;

      if (e.key === 'm' || e.key === 'M') {
        if (window.AudioSys) window.AudioSys.toggleMute();
      }

      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (gameState === 'playing' || gameState === 'paused')) {
        togglePause();
      }

      if ((e.key === 'e' || e.key === 'E') && gameState === 'playing') {
        toggleCarEntry();
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
      keys[e.code] = false;
    });

    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        startGame();
      });
    }

    requestAnimationFrame(loop);
  }

  function startGame() {
    if (window.AudioSys) window.AudioSys.init();
    People.reset();
    Vehicles.reset();
    Police.reset();
    Missions.reset();

    inCar = false;
    activeCarIndex = 0;
    gameState = 'playing';

    const overlay = document.getElementById('screen-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function togglePause() {
    if (gameState === 'playing') {
      gameState = 'paused';
      showOverlay("PAUSED", "Press P or Esc to resume", "RESUME", () => {
        gameState = 'playing';
        document.getElementById('screen-overlay').classList.add('hidden');
      });
    } else if (gameState === 'paused') {
      gameState = 'playing';
      document.getElementById('screen-overlay').classList.add('hidden');
    }
  }

  function showOverlay(title, subtitle, btnText, btnCallback) {
    const overlay = document.getElementById('screen-overlay');
    const titleEl = document.getElementById('screen-title-text');
    const subEl = document.getElementById('screen-subtitle-text');
    const btnEl = document.getElementById('action-btn');

    if (overlay && titleEl && subEl && btnEl) {
      titleEl.innerText = title;
      subEl.innerText = subtitle;
      btnEl.innerText = btnText;
      overlay.classList.remove('hidden');

      // Replace click handler
      const newBtn = btnEl.cloneNode(true);
      btnEl.parentNode.replaceChild(newBtn, btnEl);
      newBtn.addEventListener('click', btnCallback);
    }
  }

  function toggleCarEntry() {
    const player = People.getPlayer();
    const cars = Vehicles.getCars();

    if (!inCar) {
      // Find nearest car
      for (let i = 0; i < cars.length; i++) {
        let car = cars[i];
        let dist = Math.hypot(player.x - car.x, player.y - car.y);
        if (dist < 60) {
          inCar = true;
          activeCarIndex = i;
          if (window.AudioSys) window.AudioSys.startEngine();
          break;
        }
      }
    } else {
      // Exit car
      let car = cars[activeCarIndex];
      player.x = car.x + 40;
      player.y = car.y;
      inCar = false;
      if (window.AudioSys) window.AudioSys.stopEngine();
    }
  }

  function update() {
    if (gameState !== 'playing') return;

    const player = People.getPlayer();
    const cars = Vehicles.getCars();

    People.update(keys, inCar);
    Vehicles.update(keys, player, inCar ? activeCarIndex : -1);

    let targetX = player.x;
    let targetY = player.y;

    if (inCar) {
      let car = cars[activeCarIndex];
      targetX = car.x;
      targetY = car.y;
      Police.update(targetX, targetY);

      // Check collision with police or obstacles
      let wanted = Police.getWantedStars();
      if (wanted === 0 && Math.abs(car.speed) > 4 && Math.random() < 0.005) {
        Police.addWanted(1);
      }
    } else {
      Police.update(targetX, targetY);
      if (Math.random() < 0.002) {
        Police.addWanted(1);
      }
    }

    Missions.update(targetX, targetY, player);

    // Camera follow
    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;

    // Health checks
    if (player.health <= 0) {
      gameState = 'wasted';
      showOverlay("WASTED", "Busted in San Veridia", "TRY AGAIN", startGame);
    }

    HUD.update(player, inCar, cars[activeCarIndex], Police.getWantedStars(), Missions.getInfo());
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    City.render(ctx, camera);
    Vehicles.render(ctx, camera);
    People.render(ctx, camera, inCar);
    Police.render(ctx, camera);
    Missions.render(ctx, camera);
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  window.addEventListener('load', init);
})();

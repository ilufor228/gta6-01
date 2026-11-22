window.HUD = (function() {
  let minimapCanvas = null;
  let minimapCtx = null;

  function init() {
    minimapCanvas = document.getElementById('minimap-canvas');
    if (minimapCanvas) {
      minimapCtx = minimapCanvas.getContext('2d');
    }
  }

  function update(player, inCar, activeCar, wantedStars, missionInfo) {
    // Health bar
    const healthFill = document.getElementById('health-fill');
    if (healthFill) {
      healthFill.style.width = Math.max(0, player.health) + '%';
    }

    // Stamina bar
    const staminaFill = document.getElementById('stamina-fill');
    if (staminaFill) {
      staminaFill.style.width = Math.max(0, player.stamina) + '%';
    }

    // Money
    const moneyDisplay = document.getElementById('money-display');
    if (moneyDisplay) {
      moneyDisplay.innerText = '$' + player.money.toLocaleString();
    }

    // Wanted stars
    const wantedContainer = document.getElementById('wanted-stars');
    if (wantedContainer) {
      let starsHTML = '';
      for (let i = 0; i < 5; i++) {
        starsHTML += i < wantedStars ? '★' : '☆';
      }
      wantedContainer.innerHTML = starsHTML;
    }

    // Mission box
    const missionBox = document.getElementById('mission-box');
    const missionTitle = document.getElementById('mission-title');
    const missionDesc = document.getElementById('mission-desc');
    if (missionBox && missionTitle && missionDesc) {
      if (missionInfo && missionInfo.title) {
        missionBox.classList.remove('hidden');
        missionTitle.innerText = missionInfo.title;
        missionDesc.innerText = missionInfo.desc;
      } else {
        missionBox.classList.add('hidden');
      }
    }

    // Minimap rendering
    if (minimapCtx && minimapCanvas) {
      const cw = minimapCanvas.width;
      const ch = minimapCanvas.height;
      minimapCtx.fillStyle = '#0f172a';
      minimapCtx.fillRect(0, 0, cw, ch);

      const px = inCar && activeCar ? activeCar.x : player.x;
      const py = inCar && activeCar ? activeCar.y : player.y;

      const scale = 0.05;
      const mapCenterX = cw / 2;
      const mapCenterY = ch / 2;

      // Draw buildings on minimap
      const buildings = City.getBuildings();
      minimapCtx.fillStyle = '#334155';
      for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        const mx = mapCenterX + (b.x - px) * scale;
        const my = mapCenterY + (b.y - py) * scale;
        const mw = b.width * scale;
        const mh = b.height * scale;
        if (mx + mw > 0 && mx < cw && my + mh > 0 && my < ch) {
          minimapCtx.fillRect(mx, my, mw, mh);
        }
      }

      // Draw player dot on minimap
      minimapCtx.fillStyle = '#f43f5e';
      minimapCtx.beginPath();
      minimapCtx.arc(mapCenterX, mapCenterY, 5, 0, Math.PI * 2);
      minimapCtx.fill();
    }
  }

  return {
    init,
    update
  };
})();

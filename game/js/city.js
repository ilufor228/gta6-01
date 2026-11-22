window.City = (function() {
  const worldWidth = 4000;
  const worldHeight = 4000;
  const blockSize = 300;
  const roadWidth = 80;
  
  let buildings = [];
  let beachBoundary = 3200;

  function generate() {
    buildings = [];
    const cols = 12;
    const rows = 12;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * (blockSize + roadWidth) + 150;
        const y = r * (blockSize + roadWidth) + 150;
        
        if (x > beachBoundary) continue;

        const bWidth = blockSize - 40;
        const bHeight = blockSize - 40;
        
        buildings.push({
          x: x + 20,
          y: y + 20,
          width: bWidth,
          height: bHeight,
          color: ['#334155', '#475569', '#1e293b', '#64748b'][Math.floor(Math.random() * 4)],
          roofColor: ['#1e293b', '#0f172a', '#334155'][Math.floor(Math.random() * 3)]
        });
      }
    }
  }

  function checkCollision(x, y, radius) {
    if (x < 50 || x > worldWidth - 50 || y < 50 || y > worldHeight - 50) {
      return true;
    }
    if (x > beachBoundary) {
      return true;
    }
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      if (
        x + radius > b.x &&
        x - radius < b.x + b.width &&
        y + radius > b.y &&
        y - radius < b.y + b.height
      ) {
        return true;
      }
    }
    return false;
  }

  function render(ctx, camera) {
    // Ground (grass / asphalt / beach)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(-camera.x + ctx.canvas.width / 2, -camera.y + ctx.canvas.height / 2);

    // City ground
    ctx.fillStyle = '#262626';
    ctx.fillRect(0, 0, beachBoundary, worldHeight);

    // Roads (grid lines)
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = roadWidth;
    ctx.lineCap = 'square';

    for (let x = 230; x < beachBoundary; x += 380) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldHeight);
      ctx.stroke();
    }
    for (let y = 230; y < worldHeight; y += 380) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(beachBoundary, y);
      ctx.stroke();
    }

    // Road dashed center lines
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    for (let x = 230; x < beachBoundary; x += 380) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldHeight);
      ctx.stroke();
    }
    for (let y = 230; y < worldHeight; y += 380) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(beachBoundary, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Beach & Ocean on the East
    ctx.fillStyle = '#fde047'; // Sand
    ctx.fillRect(beachBoundary, 0, worldWidth - beachBoundary, worldHeight);

    ctx.fillStyle = '#0284c7'; // Ocean
    ctx.fillRect(beachBoundary + 400, 0, worldWidth - (beachBoundary + 400), worldHeight);

    // Palm trees / decorations on beach
    ctx.fillStyle = '#15803d';
    for (let py = 100; py < worldHeight; py += 300) {
      ctx.beginPath();
      ctx.arc(beachBoundary + 150, py, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Buildings
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.width, b.height);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.strokeRect(b.x, b.y, b.width, b.height);

      // Roof details / windows
      ctx.fillStyle = b.roofColor;
      ctx.fillRect(b.x + 20, b.y + 20, b.width - 40, b.height - 40);
    }

    ctx.restore();
  }

  generate();

  return {
    worldWidth,
    worldHeight,
    checkCollision,
    render,
    getBuildings: () => buildings
  };
})();

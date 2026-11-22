window.Missions = (function() {
  let activeMission = null;
  let missionTypes = ['delivery', 'race', 'cashdrops'];
  let currentTypeIndex = 0;
  let targetX = 0;
  let targetY = 0;
  let timeLeft = 0;
  let raceCheckpoints = [];
  let currentCheckpoint = 0;
  let cashDrops = [];

  function startNextMission() {
    currentTypeIndex = (currentTypeIndex + 1) % missionTypes.length;
    const type = missionTypes[currentTypeIndex];

    if (type === 'delivery') {
      activeMission = 'delivery';
      targetX = 600 + Math.random() * 2000;
      targetY = 600 + Math.random() * 2000;
      timeLeft = 60;
    } else if (type === 'race') {
      activeMission = 'race';
      raceCheckpoints = [
        { x: 800, y: 800 },
        { x: 1600, y: 800 },
        { x: 1600, y: 1600 },
        { x: 800, y: 1600 }
      ];
      currentCheckpoint = 0;
      targetX = raceCheckpoints[0].x;
      targetY = raceCheckpoints[0].y;
      timeLeft = 45;
    } else if (type === 'cashdrops') {
      activeMission = 'cashdrops';
      cashDrops = [
        { x: 1000, y: 1000, collected: false },
        { x: 1200, y: 1000, collected: false },
        { x: 1100, y: 1200, collected: false }
      ];
      targetX = cashDrops[0].x;
      targetY = cashDrops[0].y;
      timeLeft = 50;
    }
  }

  function update(px, py, player) {
    if (!activeMission) {
      startNextMission();
      return;
    }

    timeLeft -= 1 / 60;
    if (timeLeft <= 0) {
      activeMission = null;
      return;
    }

    let dist = Math.hypot(px - targetX, py - targetY);
    if (dist < 40) {
      if (window.AudioSys) window.AudioSys.playPickup();
      player.money += 500;

      if (activeMission === 'delivery') {
        activeMission = null;
      } else if (activeMission === 'race') {
        currentCheckpoint++;
        if (currentCheckpoint < raceCheckpoints.length) {
          targetX = raceCheckpoints[currentCheckpoint].x;
          targetY = raceCheckpoints[currentCheckpoint].y;
        } else {
          activeMission = null;
        }
      } else if (activeMission === 'cashdrops') {
        let uncollected = cashDrops.find(d => !d.collected);
        if (uncollected) uncollected.collected = true;
        let next = cashDrops.find(d => !d.collected);
        if (next) {
          targetX = next.x;
          targetY = next.y;
        } else {
          activeMission = null;
        }
      }
    }
  }

  function getInfo() {
    if (!activeMission) return { title: "No Mission", desc: "Finding next gig..." };
    if (activeMission === 'delivery') {
      return { title: "SMUGGLER RUN", desc: `Deliver package to target marker! Time: ${Math.ceil(timeLeft)}s` };
    }
    if (activeMission === 'race') {
      return { title: "STREET RACE", desc: `Checkpoint ${currentCheckpoint + 1}/${raceCheckpoints.length}. Time: ${Math.ceil(timeLeft)}s` };
    }
    if (activeMission === 'cashdrops') {
      let left = cashDrops.filter(d => !d.collected).length;
      return { title: "CASH DROP", desc: `Collect remaining cash bags (${left}). Time: ${Math.ceil(timeLeft)}s` };
    }
    return { title: "", desc: "" };
  }

  function render(ctx, camera) {
    if (!activeMission) return;

    ctx.save();
    ctx.translate(targetX - camera.x + ctx.canvas.width / 2, targetY - camera.y + ctx.canvas.height / 2);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 20 + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', 0, 5);
    ctx.restore();
  }

  startNextMission();

  return {
    update,
    getInfo,
    render,
    reset: startNextMission
  };
})();

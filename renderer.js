/* ==========================================================================
   DESKTOP CHAOS - RENDERER PROCESS
   Handles all independent timers, DOM elements, and chaos interactions.
   ========================================================================== */

(function () {
  'use strict';

  // --- STATE & COUNTERS ---
  let deletedFlowerCount = 0;
  let flowersDeletedSinceLastPraise = 0;
  let lastPraiseTimestamp = 0;
  let flowerIdCounter = 0;
  const activeFlowers = new Map(); // id -> DOM element

  // --- INDEPENDENT TIMER HANDLES ---
  let flowerTimer = null;
  let burstTimer = null;
  let clearPopupTimer = null;
  let f1Timer = null;
  let catTimer = null;
  let rickrollTimer = null;

  // --- AUDIO INSTANCES ---
  let currentCatAudio = null;
  let currentF1Audio = null;

  // --- DOM CONTAINERS ---
  const flowerContainer = document.getElementById('flower-container');
  const catContainer = document.getElementById('cat-container');
  const f1Container = document.getElementById('f1-container');
  const popupContainer = document.getElementById('popup-container');
  const quitBtn = document.getElementById('quit-button');
  const counterValue = document.getElementById('counter-value');

  // --- PIXELATED FLOWER DEFINITIONS & GENERATOR ---
  const PIXEL_FLOWERS = [
    // 1. Classic Pink Sakura
    {
      palette: {
        b: '#2a1420',
        p: '#ff70a6',
        h: '#ffafcc',
        s: '#d94474',
        c: '#ffea79',
        d: '#e09f3e',
        g: '#57cc99',
        l: '#38a3a5'
      },
      rows: [
        "..bb......bb..",
        ".bhhb....bhhb.",
        "bhpphb..bhpphb",
        "bppsspbbppsspb",
        ".bpppsbbssppb.",
        "..bbccddccbb..",
        "...bccddccb...",
        "..bbccddccbb..",
        ".bppssbbppsspb",
        "bphpphbbhpphpb",
        ".bhhbbggbbhhb.",
        "..bb.bllb.bb..",
        "......bb......",
        ".............."
      ]
    },
    // 2. Golden Sunflower
    {
      palette: {
        b: '#301802',
        p: '#ffb703',
        h: '#ffe169',
        s: '#fb8500',
        c: '#582f0e',
        d: '#381d07',
        g: '#70e000',
        l: '#38b000'
      },
      rows: [
        "....bb..bb....",
        "...bhhbbhhb...",
        "..bphhpphhsb..",
        ".bbppssssppbb.",
        ".bhhbccccbhhb.",
        "bbpsbccccbsspb",
        "bbpsbccccbsspb",
        ".bhhbccccbhhb.",
        ".bbppssssppbb.",
        "..bshhpphhsb..",
        "...bhhbbhhb...",
        "....bbggbb....",
        ".....bllb.....",
        "......bb......"
      ]
    },
    // 3. Crimson Rose
    {
      palette: {
        b: '#1a0810',
        p: '#e63946',
        h: '#ff758f',
        s: '#9b1d20',
        c: '#590d22',
        d: '#800f2f',
        g: '#40916c',
        l: '#1b4332'
      },
      rows: [
        "....bbbb......",
        "...bhhppb.....",
        "..bhppssppb...",
        ".bhpsscddspb..",
        ".bpsccddccsb..",
        ".bpsscddcddpb.",
        "..bpssccddspb.",
        "...bppssppb...",
        "....bbppbb.bb.",
        "...bbggbb.bggb",
        "..bllggb..blgb",
        "..bbllbb..bb..",
        "....bb........",
        ".............."
      ]
    },
    // 4. Cyan Bluebell
    {
      palette: {
        b: '#0a192f',
        p: '#00b4d8',
        h: '#90e0ef',
        s: '#0077b6',
        c: '#fff3b0',
        d: '#ffd166',
        g: '#52b788',
        l: '#2d6a4f'
      },
      rows: [
        "..bb......bb..",
        ".bhhb....bhhb.",
        "bhpphb..bhpphb",
        "bppsspbbppsspb",
        ".bpppsbbssppb.",
        "..bbccddccbb..",
        "...bccddccb...",
        "..bbccddccbb..",
        ".bppssbbppsspb",
        "bphpphbbhpphpb",
        ".bhhbbggbbhhb.",
        "..bb.bllb.bb..",
        "......bb......",
        ".............."
      ]
    },
    // 5. Purple Violet
    {
      palette: {
        b: '#210b2c',
        p: '#9d4edd',
        h: '#e0aaff',
        s: '#5a189a',
        c: '#ffea00',
        d: '#ffaa00',
        g: '#70e000',
        l: '#38b000'
      },
      rows: [
        "....bb..bb....",
        "...bhhbbhhb...",
        "..bphhpphhsb..",
        ".bbppssssppbb.",
        ".bhhbccccbhhb.",
        "bbpsbccccbsspb",
        "bbpsbccccbsspb",
        ".bhhbccccbhhb.",
        ".bbppssssppbb.",
        "..bshhpphhsb..",
        "...bhhbbhhb...",
        "....bbggbb....",
        ".....bllb.....",
        "......bb......"
      ]
    },
    // 6. Crisp Daisy
    {
      palette: {
        b: '#141c22',
        p: '#edf2f4',
        h: '#ffffff',
        s: '#8d99ae',
        c: '#ffb703',
        d: '#fb8500',
        g: '#57cc99',
        l: '#38a3a5'
      },
      rows: [
        "....bb..bb....",
        "...bhhbbhhb...",
        "..bphhpphhsb..",
        ".bbppssssppbb.",
        ".bhhbccccbhhb.",
        "bbpsbccccbsspb",
        "bbpsbccccbsspb",
        ".bhhbccccbhhb.",
        ".bbppssssppbb.",
        "..bshhpphhsb..",
        "...bhhbbhhb...",
        "....bbggbb....",
        ".....bllb.....",
        "......bb......"
      ]
    }
  ];

  function buildPixelFlowerSVG(flowerDef) {
    const { palette, rows } = flowerDef;
    const height = rows.length;
    const width = rows[0].length;
    let rects = '';
    for (let y = 0; y < height; y++) {
      const row = rows[y];
      for (let x = 0; x < width; x++) {
        const char = row[x];
        if (char !== '.' && palette[char]) {
          rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[char]}"/>`;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${rects}</svg>`;
  }

  const PIXEL_FLOWER_SVGS = PIXEL_FLOWERS.map(buildPixelFlowerSVG);

  // ==========================================================================
  // 0. MOUSE EVENT FORWARDING (OVERLAY CLICK-THROUGH)
  // ==========================================================================
  let isMouseCaptured = false;

  function setMouseCapture(capture) {
    if (capture === isMouseCaptured) return;
    isMouseCaptured = capture;
    if (window.desktopChaos && window.desktopChaos.setIgnoreMouseEvents) {
      if (capture) {
        window.desktopChaos.setIgnoreMouseEvents(false);
      } else {
        window.desktopChaos.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  }

  // Detect when cursor is hovering an interactive element
  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest('.interactive')) {
      setMouseCapture(true);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const related = e.relatedTarget;
    if (!related || !related.closest || !related.closest('.interactive')) {
      setMouseCapture(false);
    }
  });

  // Backup coordinate tracking for window edges
  window.addEventListener('mousemove', (e) => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const isInteractive = Boolean(target && target.closest && target.closest('.interactive'));
    setMouseCapture(isInteractive);
  });

  // ==========================================================================
  // 1. FLOWER SYSTEM 🌸
  // ==========================================================================
  function getRandomScreenPosition(paddingX = 60, paddingY = 80) {
    const maxX = Math.max(window.innerWidth - paddingX, 40);
    const maxY = Math.max(window.innerHeight - paddingY, 40);
    const x = Math.floor(Math.random() * maxX) + 20;
    const y = Math.floor(Math.random() * maxY) + 20;
    return { x, y };
  }

  function spawnFlower(forcedX = null, forcedY = null) {
    const flowerId = 'flower_' + (++flowerIdCounter);
    const pos = (forcedX !== null && forcedY !== null) 
      ? { x: forcedX, y: forcedY } 
      : getRandomScreenPosition();

    const flower = document.createElement('div');
    flower.id = flowerId;
    flower.className = 'chaos-flower interactive';
    flower.innerHTML = PIXEL_FLOWER_SVGS[Math.floor(Math.random() * PIXEL_FLOWER_SVGS.length)];
    flower.style.left = pos.x + 'px';
    flower.style.top = pos.y + 'px';

    // Store position data for scattering physics
    flower.dataset.x = pos.x;
    flower.dataset.y = pos.y;

    // Independent click deletion
    flower.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteFlower(flowerId);
    });

    flowerContainer.appendChild(flower);
    activeFlowers.set(flowerId, flower);
  }

  function deleteFlower(flowerId) {
    const flower = activeFlowers.get(flowerId);
    if (!flower) return;

    activeFlowers.delete(flowerId);
    flower.classList.remove('interactive');
    flower.classList.add('popping-out');

    // Update deletion score
    deletedFlowerCount++;
    flowersDeletedSinceLastPraise++;
    counterValue.textContent = deletedFlowerCount;

    setTimeout(() => {
      if (flower.parentNode) {
        flower.parentNode.removeChild(flower);
      }
    }, 250);

    // Check if user has earned praise
    checkPraiseCondition();
  }

  function spawnFlowerBurst() {
    const burstCount = Math.floor(Math.random() * 7) + 6; // 6 to 12 flowers
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        spawnFlower();
      }, i * 75);
    }
  }

  // Scattering flowers (used by F1 car and cat)
  function scatterNearbyFlowers(targetX, targetY, radius = 220) {
    const now = performance.now();
    activeFlowers.forEach((flower, id) => {
      const lastScatter = parseFloat(flower.dataset.lastScatter || 0);
      if (now - lastScatter < 800) return; // Cooldown so it flings smoothly once

      const fx = parseFloat(flower.dataset.x || 0);
      const fy = parseFloat(flower.dataset.y || 0);
      const dist = Math.hypot(fx - targetX, fy - targetY);

      if (dist < radius) {
        flower.dataset.lastScatter = now;
        // Scatter to new position with random offset
        const angle = Math.random() * Math.PI * 2;
        const pushDistance = Math.floor(Math.random() * 220) + 140;
        let newX = fx + Math.cos(angle) * pushDistance;
        let newY = fy + Math.sin(angle) * pushDistance;

        // Keep inside screen bounds
        newX = Math.max(30, Math.min(window.innerWidth - 60, newX));
        newY = Math.max(30, Math.min(window.innerHeight - 80, newY));

        flower.classList.add('scattered');
        flower.style.left = newX + 'px';
        flower.style.top = newY + 'px';
        flower.dataset.x = newX;
        flower.dataset.y = newY;

        const randomRotate = Math.floor(Math.random() * 120) - 60;
        flower.style.transform = `scale(1.2) rotate(${randomRotate}deg)`;

        setTimeout(() => {
          flower.classList.remove('scattered');
          flower.style.transform = '';
        }, 650);
      }
    });
  }

  // Independent Flower Spawn Timer (Every 3.5 - 7.5 seconds)
  function scheduleFlowerTimer() {
    const delay = Math.floor(Math.random() * 4000) + 3500;
    flowerTimer = setTimeout(() => {
      spawnFlower();
      scheduleFlowerTimer();
    }, delay);
  }

  // Independent Flower Burst Timer (Every 25 - 45 seconds)
  function scheduleBurstTimer() {
    const delay = Math.floor(Math.random() * 20000) + 25000;
    burstTimer = setTimeout(() => {
      spawnFlowerBurst();
      scheduleBurstTimer();
    }, delay);
  }

  // ==========================================================================
  // 2. CLEAR ALL SYSTEM 🧹
  // ==========================================================================
  function showClearPopup() {
    // Only show if there are flowers on screen and no active clear popup
    if (activeFlowers.size === 0 || document.querySelector('.clear-popup')) {
      return;
    }

    const popup = document.createElement('div');
    popup.className = 'clear-popup interactive';

    const title = document.createElement('div');
    title.className = 'clear-popup-title';
    title.textContent = '🌸 FLOWERS DETECTED 🌸';

    const btn = document.createElement('button');
    btn.className = 'clear-popup-btn interactive';
    btn.textContent = '[ CLEAR ALL ]';

    popup.appendChild(title);
    popup.appendChild(btn);
    popupContainer.appendChild(popup);

    let dismissed = false;

    function dismissPopup(delay = 0) {
      if (dismissed) return;
      dismissed = true;
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, delay);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.disabled) return;

      // 50% chance to fail
      const shouldFail = Math.random() < 0.5;

      if (shouldFail) {
        // FAILED BEHAVIOR: flips to NOPE
        btn.disabled = true;
        btn.classList.add('failed');
        btn.textContent = 'NOPE 😈';
        title.textContent = '❌ CLEAR FAILED!';
        dismissPopup(2500);
      } else {
        // SUCCESS BEHAVIOR: clears all flowers
        btn.disabled = true;
        btn.textContent = 'CLEARED! ✨';
        btn.style.background = '#10b981';
        btn.style.boxShadow = '0 4px #047857';

        // Animate all flowers out
        activeFlowers.forEach((flower, id) => {
          flower.classList.remove('interactive');
          flower.classList.add('popping-out');
        });

        setTimeout(() => {
          activeFlowers.forEach((flower) => {
            if (flower.parentNode) flower.parentNode.removeChild(flower);
          });
          activeFlowers.clear();
        }, 250);

        dismissPopup(1800);
      }
    });

    // Auto disappear if user ignores it
    setTimeout(() => {
      dismissPopup(0);
    }, 8000);
  }

  // Independent Clear Popup Timer (Every 30 - 60 seconds)
  function scheduleClearPopupTimer() {
    const delay = Math.floor(Math.random() * 30000) + 30000;
    clearPopupTimer = setTimeout(() => {
      showClearPopup();
      scheduleClearPopupTimer();
    }, delay);
  }

  // ==========================================================================
  // 3. F1 CAR SYSTEM 🏎️
  // ==========================================================================
  function runF1Car() {
    // Avoid multiple overlapping cars if one is already running
    if (document.querySelector('.f1-car-unit')) return;

    const carUnit = document.createElement('div');
    carUnit.className = 'f1-car-unit';

    const isLeftToRight = Math.random() < 0.5;
    const startY = Math.floor(Math.random() * (window.innerHeight - 250)) + 80;

    const smoke = document.createElement('span');
    smoke.className = 'f1-smoke-trail';
    smoke.textContent = '💨💨💨';

    const carBody = document.createElement('span');
    carBody.className = 'f1-car-body';
    carBody.textContent = '🏎️';

    const vroom = document.createElement('span');
    vroom.className = 'f1-vroom-text';
    vroom.textContent = 'VROOOOM!!';

    if (isLeftToRight) {
      carUnit.appendChild(smoke);
      carUnit.appendChild(carBody);
      carUnit.appendChild(vroom);
    } else {
      carBody.style.transform = 'scaleX(-1)';
      carUnit.appendChild(vroom);
      carUnit.appendChild(carBody);
      carUnit.appendChild(smoke);
    }

    carUnit.style.top = startY + 'px';
    f1Container.appendChild(carUnit);

    // Play F1 car sound: neow.mp3
    try {
      const f1Audio = new Audio('neow.mp3');
      f1Audio.volume = 0.8;
      f1Audio.play().catch(err => console.log('F1 audio error:', err));
      currentF1Audio = f1Audio;
    } catch (err) {
      console.log('F1 audio error:', err);
    }

    const screenWidth = window.innerWidth;
    const duration = 1400; // 1.4 seconds fast zoom
    const startTime = performance.now();

    const startX = isLeftToRight ? -350 : screenWidth + 100;
    const endX = isLeftToRight ? screenWidth + 200 : -450;

    function animateCar(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentX = startX + (endX - startX) * progress;

      carUnit.style.left = currentX + 'px';

      // Scatter flowers near the car's current position!
      scatterNearbyFlowers(currentX + 100, startY + 30, 220);

      if (progress < 1) {
        requestAnimationFrame(animateCar);
      } else {
        if (carUnit.parentNode) {
          carUnit.parentNode.removeChild(carUnit);
        }
      }
    }

    requestAnimationFrame(animateCar);
  }

  // Independent F1 Car Timer (Every 25 - 50 seconds)
  function scheduleF1Timer() {
    const delay = Math.floor(Math.random() * 25000) + 25000;
    f1Timer = setTimeout(() => {
      runF1Car();
      scheduleF1Timer();
    }, delay);
  }

  // ==========================================================================
  // 4. CAT SYSTEM 🐈
  // ==========================================================================
  function runCat() {
    if (document.querySelector('.ascii-cat-wrapper')) return;

    const catWrapper = document.createElement('div');
    catWrapper.className = 'ascii-cat-wrapper interactive';

    const catBox = document.createElement('div');
    catBox.className = 'ascii-cat-box';

    const line1 = document.createElement('div');
    line1.textContent = ' /\\_/\\ ';
    const line2 = document.createElement('div');
    line2.textContent = '( o.o )';
    const line3 = document.createElement('div');
    line3.textContent = ' > ^ < ';

    catBox.appendChild(line1);
    catBox.appendChild(line2);
    catBox.appendChild(line3);
    catWrapper.appendChild(catBox);

    // Interactive Meow on click
    catWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      showCatSpeechBubble(catWrapper, 'meow. 🐾');
    });

    const isLeftToRight = Math.random() < 0.5;
    const startY = Math.floor(Math.random() * (window.innerHeight - 200)) + 60;
    catWrapper.style.top = startY + 'px';

    catContainer.appendChild(catWrapper);

    // Play Cat sound: nyan-cat_1.mp3 during walk
    let catAudio = null;
    try {
      catAudio = new Audio('nyan-cat_1.mp3');
      catAudio.volume = 0.65;
      catAudio.loop = true;
      catAudio.play().catch(err => console.log('Cat audio error:', err));
      currentCatAudio = catAudio;
    } catch (err) {
      console.log('Cat audio error:', err);
    }

    const screenWidth = window.innerWidth;
    const duration = 12000; // 12 seconds walk
    const startTime = performance.now();
    const startX = isLeftToRight ? -140 : screenWidth + 50;
    const endX = isLeftToRight ? screenWidth + 50 : -140;

    let lastScatterTime = 0;
    let walkStep = false;

    function animateCat(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentX = startX + (endX - startX) * progress;

      catWrapper.style.left = currentX + 'px';

      // Alternate paws walking
      if (Math.floor(elapsed / 300) % 2 === 0) {
        if (!walkStep) {
          line3.textContent = ' < ^ > ';
          walkStep = true;
        }
      } else {
        if (walkStep) {
          line3.textContent = ' > ^ < ';
          walkStep = false;
        }
      }

      // Cat occasionally paws & scatters nearby flowers (every ~2 seconds)
      if (now - lastScatterTime > 2200) {
        lastScatterTime = now;
        scatterNearbyFlowers(currentX + 50, startY + 30, 160);
      }

      if (progress < 1) {
        requestAnimationFrame(animateCat);
      } else {
        if (catAudio) {
          catAudio.pause();
          catAudio.currentTime = 0;
          if (currentCatAudio === catAudio) {
            currentCatAudio = null;
          }
        }
        if (catWrapper.parentNode) {
          catWrapper.parentNode.removeChild(catWrapper);
        }
      }
    }

    requestAnimationFrame(animateCat);
  }

  function showCatSpeechBubble(catWrapper, text) {
    const existingBubble = catWrapper.querySelector('.cat-speech-bubble');
    if (existingBubble) existingBubble.remove();

    const bubble = document.createElement('div');
    bubble.className = 'cat-speech-bubble';
    bubble.textContent = text;
    catWrapper.appendChild(bubble);

    setTimeout(() => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    }, 2000);
  }

  // Independent Cat Timer (Every 30 - 55 seconds)
  function scheduleCatTimer() {
    const delay = Math.floor(Math.random() * 25000) + 30000;
    catTimer = setTimeout(() => {
      runCat();
      scheduleCatTimer();
    }, delay);
  }

  // ==========================================================================
  // 5. RICKROLL SYSTEM 🎵
  // ==========================================================================
  function triggerRickrollPopup() {
    if (document.querySelector('.rickroll-popup')) return;

    const popup = document.createElement('div');
    popup.className = 'rickroll-popup interactive';

    const header = document.createElement('div');
    header.className = 'rickroll-header';
    header.textContent = '⚠ PRODUCTIVITY ALERT ⚠';

    const text = document.createElement('div');
    text.className = 'rickroll-text';
    text.textContent = "You've been productive for too long.";

    const btn = document.createElement('button');
    btn.className = 'rickroll-btn interactive';
    btn.textContent = 'OK';

    popup.appendChild(header);
    popup.appendChild(text);
    popup.appendChild(btn);
    popupContainer.appendChild(popup);

    function launchRickroll() {
      if (window.desktopChaos && window.desktopChaos.openExternalUrl) {
        window.desktopChaos.openExternalUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      }
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      launchRickroll();
    });

    // Auto-launch if ignored after 6 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        launchRickroll();
      }
    }, 6000);
  }

  // Independent Rickroll Timer (Relatively rare: every 90 - 180 seconds)
  function scheduleRickrollTimer() {
    const delay = Math.floor(Math.random() * 90000) + 90000;
    rickrollTimer = setTimeout(() => {
      triggerRickrollPopup();
      scheduleRickrollTimer();
    }, delay);
  }

  // ==========================================================================
  // 6. "YOU SEEM TO BE HANDLING THIS WELL" 💬
  // ==========================================================================
  function checkPraiseCondition() {
    const now = Date.now();
    // After user has deleted at least 8 flowers and at least 25s passed since last praise
    if (flowersDeletedSinceLastPraise >= 8 && (now - lastPraiseTimestamp > 25000)) {
      flowersDeletedSinceLastPraise = 0;
      lastPraiseTimestamp = now;
      showPraisePopup();
    }
  }

  function showPraisePopup() {
    if (document.querySelector('.praise-popup')) return;

    const popup = document.createElement('div');
    popup.className = 'praise-popup';
    popup.textContent = 'You seem to be handling this well. 🌸👍';

    popupContainer.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 3600);
  }

  // ==========================================================================
  // 9. QUIT BUTTON ☠️ & SHUTDOWN
  // ==========================================================================
  function stopAllChaosAndQuit() {
    // Clear all timers
    clearTimeout(flowerTimer);
    clearTimeout(burstTimer);
    clearTimeout(clearPopupTimer);
    clearTimeout(f1Timer);
    clearTimeout(catTimer);
    clearTimeout(rickrollTimer);

    // Stop and silence audio
    if (currentF1Audio) {
      try {
        currentF1Audio.pause();
        currentF1Audio.currentTime = 0;
      } catch (e) {}
      currentF1Audio = null;
    }
    if (currentCatAudio) {
      try {
        currentCatAudio.pause();
        currentCatAudio.currentTime = 0;
      } catch (e) {}
      currentCatAudio = null;
    }

    // Empty containers
    flowerContainer.innerHTML = '';
    catContainer.innerHTML = '';
    f1Container.innerHTML = '';
    popupContainer.innerHTML = '';
    activeFlowers.clear();

    // Call Electron main process exit
    if (window.desktopChaos && window.desktopChaos.quitApp) {
      window.desktopChaos.quitApp();
    }
  }

  quitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stopAllChaosAndQuit();
  });

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    // Initial silent period: first flower appears after 2 seconds
    setTimeout(() => {
      spawnFlower();
    }, 2000);

    // Start all independent timers
    scheduleFlowerTimer();
    scheduleBurstTimer();
    scheduleClearPopupTimer();
    scheduleF1Timer();
    scheduleCatTimer();
    scheduleRickrollTimer();
  });

})();

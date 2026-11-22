import puppeteer from 'puppeteer';
import http from 'node:http';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

// Simple static file server
import fs from 'node:fs';
import url from 'node:url';
import pathModule from 'node:path';

const PORT = 8901;
const PUBLIC_DIR = pathModule.resolve('game');

const server = http.createServer((req, res) => {
  let parsedUrl = url.parse(req.url);
  let pathname = pathModule.join(PUBLIC_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  
  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      let ext = pathModule.extname(pathname);
      let mime = 'text/html';
      if (ext === '.js') mime = 'application/javascript';
      if (ext === '.css') mime = 'text/css';
      if (ext === '.jpg') mime = 'image/jpeg';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  
  mkdirSync('screenshots', { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('PAGE CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
  });

  try {
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully.');

    // 1. Capture 4-start.jpg
    await page.screenshot({ path: 'screenshots/4-start.jpg', type: 'jpeg', quality: 80 });
    console.log('Captured 4-start.jpg');

    // Click START GAME button
    await page.click('#action-btn');
    await new Promise(r => setTimeout(r, 1000));

    // Capture 2-city.jpg (on foot)
    await page.screenshot({ path: 'screenshots/2-city.jpg', type: 'jpeg', quality: 80 });
    console.log('Captured 2-city.jpg');

    // Walk around using keys
    await page.keyboard.down('KeyW');
    await page.keyboard.down('ShiftLeft');
    await new Promise(r => setTimeout(r, 1500));
    await page.keyboard.up('KeyW');
    await page.keyboard.up('ShiftLeft');

    // Enter car (press E)
    await page.keyboard.press('KeyE');
    await new Promise(r => setTimeout(r, 1000));

    // Drive around
    await page.keyboard.down('KeyW');
    await page.keyboard.down('KeyD');
    await new Promise(r => setTimeout(r, 2000));
    await page.keyboard.up('KeyW');
    await page.keyboard.up('KeyD');

    // Capture 3-mission.jpg
    await page.screenshot({ path: 'screenshots/3-mission.jpg', type: 'jpeg', quality: 80 });
    console.log('Captured 3-mission.jpg');

    // Trigger police chase / wanted level
    await page.evaluate(() => {
      if (window.Police) window.Police.setWantedStars(2);
    });
    await new Promise(r => setTimeout(r, 1000));

    // Capture 1-chase.jpg (cover)
    await page.screenshot({ path: 'screenshots/1-chase.jpg', type: 'jpeg', quality: 80 });
    console.log('Captured 1-chase.jpg');

  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('Play-test and screenshot capture finished.');
  }
});

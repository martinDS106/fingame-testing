#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const PORT = process.env.EXPO_DEV_PORT || '8081';

function killWindows() {
  try {
    const lines = execSync(`netstat -ano | findstr ":${PORT} "`, {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);

    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }

    if (pids.size === 0) {
      console.log(`[kill-node] Port ${PORT} is free.`);
      return;
    }

    for (const pid of pids) {
      try {
        if (pid === '0') {
          console.log('[kill-node] Skipping pid 0');
          continue;
        }
        const tasklist = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
          encoding: 'utf8',
        });
        const procName = tasklist.split(',')[0]?.replace(/"/g, '') || '';

        const img = execSync(
          `wmic process where "ProcessId=${pid}" get ExecutablePath /format:list 2>nul`,
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
        );
        const execPath = (img.match(/ExecutablePath=(.+)/) || [])[1] || '';

        if (execPath.toLowerCase().includes(path.join('cursor', 'resources'))) {
          console.log(`[kill-node] Skipping Cursor helper pid ${pid}`);
          continue;
        }

        console.log(`[kill-node] Killing ${procName} pid ${pid}`);
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      } catch {
        // ignore
      }
    }
  } catch {
    console.log(`[kill-node] Port ${PORT} is free.`);
  }
}

function killUnix() {
  try {
    const pids = execSync(`lsof -ti tcp:${PORT}`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    for (const pid of pids) {
      console.log(`[kill-node] Killing pid ${pid}`);
      try {
        execSync(`kill -9 ${pid}`);
      } catch {
        // ignore
      }
    }
  } catch {
    console.log(`[kill-node] Port ${PORT} is free.`);
  }
}

if (os.platform() === 'win32') {
  killWindows();
} else {
  killUnix();
}

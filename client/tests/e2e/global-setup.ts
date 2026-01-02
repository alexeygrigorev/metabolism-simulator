// Global setup for Playwright e2e tests
// Starts the backend server before running tests

import { spawn, exec } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// tests/e2e -> client -> root (need to go up TWO levels from client, not from tests/e2e)
// tests/e2e = client/tests/e2e, so going up one level is client, going up two is client/.. which doesn't work
// We need to go from client/tests/e2e to root
const clientDir = resolve(__dirname, '../..');
const rootDir = resolve(clientDir, '..');
const serverDir = resolve(rootDir, 'server');

// Helper function to kill processes on a port
function killPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (!stdout) {
          resolve();
          return;
        }
        const lines = stdout.trim().split('\n');
        const pids = new Set<string>();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            pids.add(parts[parts.length - 1]); // Last column is PID
          }
        });
        pids.forEach(pid => {
          try {
            exec(`taskkill /F /PID ${pid}`, () => {});
          } catch {
            // Ignore errors
          }
        });
        setTimeout(resolve, 500);
      });
    } else {
      exec(`lsof -ti:${port} | xargs kill -9`, () => resolve());
    }
  });
}

export default async function () {
  console.log('Starting backend server for e2e tests...');
  console.log('Root directory:', rootDir);
  console.log('Server directory:', serverDir);

  // Check if server directory exists
  if (!fs.existsSync(serverDir)) {
    console.error('Server directory not found:', serverDir);
    return;
  }

  // Kill any existing server on port 3000
  await killPort(3000);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Read server package.json to find the dev script
  const serverPackageJson = JSON.parse(fs.readFileSync(resolve(serverDir, 'package.json'), 'utf-8'));
  console.log('Server dev script:', serverPackageJson.scripts?.dev);

  // Start the backend server using tsx directly
  const backendProcess = spawn('npx', ['tsx', 'watch', 'src/index.ts'], {
    cwd: serverDir,
    stdio: 'pipe',
    shell: true,
    detached: false,
    env: { ...process.env, NODE_ENV: 'test', PORT: '3000' },
  });

  // Log backend output for debugging
  backendProcess.stdout?.on('data', (data: Buffer) => {
    const output = data.toString();
    // Only log important messages
    if (output.includes('listening') || output.includes('Server') || output.includes('error') || output.includes('ready')) {
      console.log('[Backend]', output.trim());
    }
  });

  backendProcess.stderr?.on('data', (data: Buffer) => {
    const output = data.toString();
    // Only log errors, not vite deprecation warnings
    if (output.includes('error') || output.includes('Error') || output.includes('ERR')) {
      console.error('[Backend Error]', output);
    }
  });

  backendProcess.on('error', (err: any) => {
    console.error('[Backend Process Error]', err);
  });

  // Wait for server to be ready
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.log('Backend server startup timeout (continuing anyway)');
      resolve();
    }, 12000); // Give it more time to start

    // Resolve as soon as we see "Server listening"
    backendProcess.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes('Server listening') || data.toString().includes('listening at')) {
        clearTimeout(timeout);
        console.log('Backend server is ready');
        resolve();
      }
    });
  });

  // Store process reference for later cleanup
  (global as any).__backendProcess = backendProcess;
  (global as any).__backendPid = backendProcess.pid;
}

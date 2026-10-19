import "dotenv/config";

import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const stateDir = join(root, ".dev");
const pidFile = join(stateDir, "api.pid");
const logFile = join(stateDir, "api.log");
const port = process.env.PORT || "3000";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    stdio: "ignore",
    ...options,
  });
}

function dockerReady() {
  return run("docker", ["info"]).status === 0;
}

function postgresReady() {
  return (
    run("docker", [
      "compose",
      "exec",
      "-T",
      "postgres",
      "pg_isready",
      "-U",
      "postgres",
      "-d",
      "smart_cover_assistant",
    ]).status === 0
  );
}

async function waitFor(check, label, seconds = 120) {
  for (let i = 0; i < seconds; i++) {
    if (await check()) return;
    await sleep(1000);
  }

  throw new Error(`${label} was not ready after ${seconds} seconds`);
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function getApiPid() {
  if (!existsSync(pidFile)) return null;

  const pid = Number(readFileSync(pidFile, "utf8").trim());

  if (!Number.isInteger(pid) || pid <= 0) return null;

  return pid;
}

function isOurApi(pid) {
  if (!processExists(pid)) return false;

  const result = run("ps", ["-p", String(pid), "-o", "command="], {
    stdio: ["ignore", "pipe", "ignore"],
    encoding: "utf8",
  });

  return result.status === 0 && /\bnpm run dev\b/.test(result.stdout || "");
}

async function apiReady() {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function stopApi() {
  const pid = getApiPid();

  if (!pid) {
    console.log("API: no tracked process.");
    return;
  }

  if (!isOurApi(pid)) {
    console.log("API: tracked process no longer exists or does not match.");
    rmSync(pidFile, { force: true });
    return;
  }

  console.log("Stopping Express API...");

  // Stop the process group, including tsx and its child process.
  process.kill(-pid, "SIGTERM");

  try {
    await waitFor(() => !isOurApi(pid), "API shutdown", 15);
  } catch {
    // Check the same tracked process before forcefully terminating it.
    if (isOurApi(pid)) {
      process.kill(-pid, "SIGKILL");
    }
  }

  rmSync(pidFile, { force: true });
  console.log("API stopped.");
}

async function up() {
  mkdirSync(stateDir, { recursive: true });

  const existingPid = getApiPid();

  if (existingPid && isOurApi(existingPid)) {
    console.log("GoldmanStacks API is already running.");
    console.log("Nothing to restart.");
    return;
  }

  rmSync(pidFile, { force: true });

  console.log("Starting GoldmanStacks...");

  if (!dockerReady()) {
    console.log("Opening Docker Desktop...");

    const result = run("docker", ["desktop", "start"]);

    if (result.status !== 0) {
      throw new Error("Could not launch Docker Desktop.");
    }
  }

  console.log("Waiting for Docker Engine...");
  await waitFor(dockerReady, "Docker Engine");
  console.log("Docker ready.");

  console.log("Starting PostgreSQL...");

  if (run("docker", ["compose", "up", "-d", "postgres"]).status !== 0) {
    throw new Error("Could not start PostgreSQL.");
  }

  console.log("Waiting for PostgreSQL...");
  await waitFor(postgresReady, "PostgreSQL");
  console.log("PostgreSQL ready.");

  if (await apiReady()) {
    throw new Error(
      `An API is already responding on port ${port}. Stop it before starting.`,
    );
  }

  console.log("Starting Express API...");

  const logFd = openSync(logFile, "a");

  const child = spawn("npm", ["run", "dev"], {
    cwd: root,
    detached: true,
    stdio: ["ignore", logFd, logFd],
  });

  // The API runs independently of the current terminal.
  child.unref();

  if (!child.pid) {
    throw new Error("Failed to launch the API process.");
  }

  writeFileSync(pidFile, String(child.pid));

  try {
    await waitFor(apiReady, "Express API", 30);
  } catch (error) {
    await stopApi();
    throw error;
  }

  console.log(`API ready: http://localhost:${port}/health`);
  console.log("GoldmanStacks is ready for development.");
  console.log("`npm run dev:down` when finished");
}

async function down() {
  console.log("Stopping GoldmanStacks...");

  await stopApi();

  if (dockerReady()) {
    console.log("Stopping development PostgreSQL...");

    if (run("docker", ["compose", "stop", "postgres"]).status !== 0) {
      throw new Error("Failed to stop development PostgreSQL.");
    }

    // Stop the separate test database if it is running.
    const testCompose = join(root, "docker-compose.test.yml");

    if (existsSync(testCompose)) {
      console.log("Stopping test PostgreSQL...");

      if (
        run("docker", [
          "compose",
          "-p",
          "goldmanstacks-test",
          "-f",
          testCompose,
          "stop",
        ]).status !== 0
      ) {
        throw new Error("Failed to stop test PostgreSQL.");
      }
    }
  }

  console.log("Quitting Docker Desktop...");

  const quit = run("docker", ["desktop", "stop", "--timeout", "60"]);

  if (quit.status !== 0) {
    throw new Error("Could not quit Docker Desktop.");
  }

  await waitFor(() => !dockerReady(), "Docker shutdown", 60);

  console.log("GoldmanStacks stopped.");
  console.log("PostgreSQL data has been preserved.");
}

const command = process.argv[2];

try {
  if (command === "up") {
    await up();
  } else if (command === "down") {
    await down();
  } else {
    throw new Error("Usage: node scripts/dev.mjs up|down");
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}

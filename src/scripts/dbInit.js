"use strict";

const { execSync } = require("child_process");

function run(command, options = {}) {
  const { ignoreAlreadyExists = false } = options;

  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      env: process.env,
    });
    if (output) process.stdout.write(output);
    return;
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout) : "";
    const stderr = error.stderr ? String(error.stderr) : "";
    const combined = `${stdout}\n${stderr}`;

    if (ignoreAlreadyExists && /already exists|database exists/i.test(combined)) {
      process.stdout.write("[db:init] Database already exists, skipping create.\n");
      return;
    }

    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    throw error;
  }
}

function main() {
  process.stdout.write("[db:init] Running db:create...\n");
  run("npx sequelize-cli db:create", { ignoreAlreadyExists: true });

  process.stdout.write("[db:init] Running db:migrate...\n");
  run("npx sequelize-cli db:migrate");

  process.stdout.write("[db:init] Running db:seed:all...\n");
  run("npx sequelize-cli db:seed:all");

  process.stdout.write("[db:init] Database is ready.\n");
}

main();

#!/usr/bin/env node

const { runCli } = require("../src/cli");

runCli()
  .then((code) => {
    process.exitCode = typeof code === "number" ? code : 0;
  })
  .catch((error) => {
    const message = error && error.message ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });

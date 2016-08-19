"use strict";

// If this isn't mipsel, bailout.
if (process.arch !== "mipsel") {
  process.exit();
}

const cp = require("child_process");
const opkgName = "mjpg-streamer";
const binaryName = "mjpg_streamer";
const which = cp.spawnSync("which", [binaryName]);

// When the binary doesn't exist, `status` will contain the exit code 1
if (which.status === 1) {
  // ...However, when it comes to exit codes...
  // opkg update will return with a status = 1, but that's just because
  // it might fail to wget a non-existant package list, which is not fatal.
  cp.spawnSync("opkg", ["update"]);

  const install = cp.spawnSync("opkg", ["install", opkgName]);
  const result = install.status !== 0 ? "did not install." : "installed successfully.";
  const extra = install.status !== 0 ? install.stderr.toString() : "";

  console.log(`${opkgName} ${result}. ${extra}`);

  // Exit with the status of the opkg install operation
  process.exit(install.status);
}

console.log(`${opkgName} is already installed.`);


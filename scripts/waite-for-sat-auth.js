const fs = require("fs");

const pathToLib = "./dist/sat-auth";

function waitFor(path) {
  if (!fs.existsSync(path)) setTimeout(() => waitFor(path), 500);
}

waitFor(pathToLib);

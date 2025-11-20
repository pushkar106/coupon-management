/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const distServer = path.join(__dirname, 'dist', 'server.js');

if (!fs.existsSync(distServer)) {
  // eslint-disable-next-line no-console
  console.error('Build output not found. Run "npm run build" first.');
  process.exit(1);
}

// eslint-disable-next-line import/no-dynamic-require, global-require
require(distServer);


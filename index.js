const core = require('@actions/core');
const finalhandler = require('finalhandler');
const fs = require('fs');
const http = require('http');
const path = require('path');
const serveStatic = require('serve-static');

const PORT_MIN = 0;
const PORT_MAX = 65353;
const RESPONSE_HEADER_DELIMETER = '@@';
const RESPONSE_HEADER_KEY_VALUE_DELIMETER = '~~';
const RECURSE_THROUGH_ARTIFACT_DIR = false;

const validateArtifactDirectoryPath = (artifactDirPath) => {
  if (!fs.existsSync(artifactDirPath)) {
    throw new Error(
      `Expected to find a folder at "${artifactDirPath}", but did not`
    );
  }

  const findFilesAtLevel = (dir) => {
    fs.readdirSync(dir).forEach((name) => {
      const filePath = path.join(dir, name);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        files.push(name);
      } else if (stat.isDirectory()) {
        if (RECURSE_THROUGH_ARTIFACT_DIR) {
          findFilesAtLevel(filePath);
        }
      }
    });
  };

  const files = [];
  findFilesAtLevel(artifactDirPath);

  if (!files.length) {
    throw new Error(`Found 0 files in "${artifactDirPath}"`);
  }

  console.log(
    `Found the following files in "${artifactDirPath}": ${files.join(', ')}`
  );
};

const validatePort = (port) => {
  const isInt = (val) => {
    var x = parseFloat(val);
    return !isNaN(val) && (x | 0) === x;
  };

  if (!isInt(port)) {
    throw new Error(`Specified port (${port}) is not an integer`);
  }

  const portNum = +port;
  if (portNum < PORT_MIN || portNum > PORT_MAX) {
    throw new Error(
      `Specified port (${port}) is not within the allowed range (${PORT_MIN}-${PORT_MAX})`
    );
  }
};

try {
  // Retrieve inputs
  const artifactDirPath = core.getInput('artifact-dir-path');
  const responseHeaders = core.getInput('response-headers');
  const port = core.getInput('port');

  // Validate inputs
  validateArtifactDirectoryPath(artifactDirPath);
  validatePort(port);
  const portNum = +port;

  // Set headers
  let options = {};
  if (responseHeaders) {
    const headers = responseHeaders.split(RESPONSE_HEADER_DELIMETER);

    function setHeaders(res) {
      headers.forEach((header) => {
        const headerKeyValuePair = header.split(
          RESPONSE_HEADER_KEY_VALUE_DELIMETER
        );
        res.setHeader(headerKeyValuePair[0], headerKeyValuePair[1]);
      });
    }

    options = {
      setHeaders: setHeaders,
    };
  }

  // Serve up public folder
  var serve = serveStatic(artifactDirPath, options);

  // Create server
  var server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res));
  });

  // Listen
  console.log(`Serving files on localhost:${port}`);
  server.listen(portNum);
} catch (error) {
  core.setFailed(error.message);
}

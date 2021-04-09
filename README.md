# serve-static-action

This action will serve static files from a specified localhost port.

## Inputs

### `artifact-dir-path`

**Required** Path to the directory containing files to be served.

### `port`

**Optional** Port on localhost to serve files. Default `8080`.

### `response-headers`

**Optional** Delimited list of response headers.

To allow the most flexibility, response headers can all be passed in in a single string.  Each header should be separated by `@@` and an individual header key and value should be separated by `~~`.

## Example usage

uses: actions/serve-static-action
with:
	artifact-dir-path: dist/artifacts
	port: 9000
	response-headers: "Access-Control-Allow-Origin~~*@@Content-Type~~text/html; charset=UTF-8"

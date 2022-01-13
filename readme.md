# Vuindows Server

[![Click for full screen preview](https://github.com/tetreum/vuindows-server/raw/master/preview/preview.gif)](https://cdn.jsdelivr.net/gh/tetreum/vuindows-server/preview/preview.mp4)

(Click for full screen preview)

Handles Vuindows auth & commands, letting you manage a windows or linux pc from your desktop using Vuindows UI.

## Install

1. Download the latest version from [https://github.com/tetreum/vuindows-server/releases/latest](https://github.com/tetreum/vuindows-server/releases/latest)
2. `npm i`
3. `npm run dev`
4. Access [http://localhost:8081](http://localhost:8081)

## Working apps:
- FileExplorer -> Browse directory, move file, create folder, remove, rename, context/left menu, favorite

## Documentation

The server enables a REST API for authentication at /api/login which returns a JWT token on success.
After that, user will be able connect to websockets server, which is the one responsible for receiving and processing commands.
Available commands can be found at https://github.com/tetreum/vuindows-server/blob/master/socketserver.js#L53

## Development
- `npm i`
- `npm run dev`
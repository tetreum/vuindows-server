# Vuindows Server

[![Click for full screen preview](https://github.com/tetreum/vuindows-server/raw/master/preview/preview.gif)](https://cdn.jsdelivr.net/gh/tetreum/vuindows-server/preview/preview.mp4)

(Click for full screen preview)

Handles Vuindows auth & commands, letting you manage a windows or linux pc from your desktop using Vuindows UI.

## Vuindows client

It can be found on the following branch https://github.com/tetreum/Vuindows/tree/remote-controller

## Working apps:
- FileExplorer -> Browse directory, move file, create folder, remove, rename

## Documentation

The server enables a REST API for authentication at /api/login which returns a JWT token on success.
After that, user will be able connect to websockets server, which is the one responsible for receiving and processing commands.
Available commands can be found at https://github.com/tetreum/vuindows-server/blob/master/socketserver.js#L53

## Development
- `npm i`
- `npm run dev`
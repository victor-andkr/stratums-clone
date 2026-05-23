# Stratums-client-source
This repository includes the full Stratums.io client source code organised for local development.

## Building and using your own bundle

First what you need to do, is open a new terminal and navigate to the directory where you want to install the client.

You then need to clone the repository and go into the client workspace.

```bash
git clone https://github.com/yourusername/stratums-client-source
cd stratums-client-source
```

Then, you need to install the dependencies.

```bash
npm install
```

### Available scripts

The project ships with a couple of npm scripts to help with local development:

- `npm run build` – bundles the client using webpack.
- `npm run start` – serves the project with `live-server` on port 6969.
- `npm run dev` – runs the build and then starts the development server.

After running `npm run dev`, you will see a message like this in the terminal:

```yaml
Ready for changes
```

You're all set!

## Project structure

The client code is organised into five top-level categories to keep related files together:

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Application bootstrap, configuration, store logic, and UI controllers. |
| `src/domain/` | Core gameplay domain: entities, managers, networking, and AI logic. |
| `src/ui/` | UI helpers such as animated text rendering. |
| `src/shared/` | Shared constants, utilities, and bundled vendor scripts. |
| `src/mod/engine/` | Feature modules (reload manager, tick scheduler, packet bridge, player state) shared by client mods. |
| `src/mod/mods/` | Pluggable mod implementations such as the reload-ring renderer. |
| `src/assets/` | Static assets including audio helpers bundled with the client. |

The webpack entry point now targets `src/app/main/index.ts`, which composes modules from the new structure.

### Modding quick start

Built-in mods are wired through `src/mod/modLoader.js`. Drop additional mods
under `src/mod/mods/` and export an `init(context)` function; the loader will
hand you references to `reloadEngine`, `tickScheduler`, `packetBridge`, and
`playerState` so you can drive HUD elements or automation without touching the
core client.

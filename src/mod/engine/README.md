# Mod Engine

This directory contains the core modding engine components that are shared across all client mods.

## Components

- **reloadManager.js**: Manages weapon reload timing and state
- **tickScheduler.js**: Provides a consistent tick-based scheduling system
- **packetBridge.js**: Bridges packet traffic for interception/modification
- **playerState.js**: Registry for tracking player state across mods

These components are injected into mods via the `context` object in `modLoader.js`.

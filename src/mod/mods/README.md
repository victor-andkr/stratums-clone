# Mods

This directory contains pluggable mod implementations.

## Adding a Mod

To add a new mod:

1. Create a new file in this directory (or in a subdirectory)
2. Export an object with an `init(context)` function
3. The `context` object provides:
   - `reloadEngine`: Weapon reload management
   - `tickScheduler`: Tick-based scheduling
   - `packetBridge`: Packet interception
   - `playerState`: Player state registry
   - `documentRef`: Reference to document (if available)
   - `getLocalPlayer()`: Function to get the local player
   - `getAimDirection()`: Function to get current aim direction
   - `onCleanup(fn)`: Register cleanup callbacks

## Example

```javascript
module.exports = {
  name: 'MyMod',
  init: function(context) {
    const { reloadEngine, tickScheduler } = context;
    
    // Your mod logic here
  }
};
```

## Examples

See the `examples/` directory for sample mod implementations.

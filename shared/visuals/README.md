# Shared Visuals Module

This directory contains a shared Visuals module that can be used by both the moomoo-clone client and userscripts, avoiding code duplication.

## Structure

- `index.js` - The shared Visuals module (can be required by moomoo-clone)
- `userscript.user.js` - Userscript version that uses the shared module when available
- `README.md` - This file

## Features

The Visuals module includes:

- **Key Overlay**: Displays WASD keys and custom keys with visual feedback
- **CPS Counter**: Tracks clicks per second (left/right mouse and total)
- **Draggable UI**: Right-click drag to reposition the overlay
- **Altcha Bypass**: Auto-verifies Altcha on moomoo.io
- **Custom Store Style**: Transparent store UI

## Usage

### In moomoo-clone

The shared module is automatically loaded in `client/src/index.js`:

```javascript
try {
    var Visuals = require("../../shared/visuals/index.js");
    window.Visuals = Visuals;
} catch (e) {
    console.log("[Visuals] Shared module not found, skipping");
}
```

This makes `window.Visuals` available for the client code to use.

### As a Userscript

Install `userscript.user.js` in Tampermonkey/Greasemonkey. The userscript:

1. Checks if `window.Visuals` exists (from moomoo-clone)
2. If yes, uses the shared module
3. If no, uses the embedded fallback code
4. Similarly checks for `window.PACKETCODE` and `window.UTILS`

This ensures the userscript works on both:
- Original moomoo.io (uses embedded code)
- moomoo-clone (uses shared code from window)

## Code Sharing Strategy

The userscript uses fallback patterns to avoid duplication:

```javascript
const Visuals = window.Visuals || { /* embedded version */ };
const PACKETCODE = window.PACKETCODE || { /* embedded version */ };
const UTILS = window.UTILS || { /* embedded version */ };
```

This means:
- When running on moomoo-clone, it uses the actual shared code
- When running on original moomoo.io, it uses the embedded version
- No need to rewrite the entire game bundle

## MooMoo.io Script Template Integration

The userscript is based on the MooMoo.io Script Template structure:
- Packet codes (SEND/RECEIVE)
- Utility functions (lerp, getDistance, getDirection, lerpAngle)
- Template-style packet interception hooks

This provides a solid foundation for extending with custom features.

## Development

To modify the shared code:

1. Edit `shared/visuals/index.js`
2. Changes will automatically be available to:
   - moomoo-clone client (via require)
   - userscript (via window.Visuals check)

To modify the userscript-specific code:

1. Edit `shared/visuals/userscript.user.js`
2. Keep the fallback patterns for shared modules

## License

MIT

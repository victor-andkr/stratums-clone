'use strict';

// Built-in mods for Stratums client
// Add your mods to the builtinMods array

const builtinMods = [];

function initializeMods(context) {
  builtinMods.forEach(mod => {
    if (!mod || typeof mod.init !== 'function') {
      return;
    }
    try {
      mod.init(context);
    } catch (err) {
      console.error('Failed to initialise mod', mod.name || 'anonymous mod', err);
    }
  });
}

module.exports = {
  initializeMods
};

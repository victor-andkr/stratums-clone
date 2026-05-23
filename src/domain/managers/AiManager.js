'use strict';

// AiManager for managing AI entities
// Based on Stratums.io bundle structure

const AI = require('../entities/AI');
const aiDefinitions = require('../game/ai/aiDefinitions');

class AiManager {
  constructor(AIClass) {
    this.aiTypes = aiDefinitions.AI;
    this.AI = AIClass || AI;
    this.ais = [];
    this.activeCount = 0;
  }

  spawn(x, y, dir, aiTypeIndex) {
    let ai = null;
    
    // Try to find inactive slot
    for (let i = 0; i < this.ais.length; i++) {
      if (!this.ais[i].active) {
        ai = this.ais[i];
        break;
      }
    }

    // Create new AI if needed
    if (!ai) {
      ai = new this.AI(this.ais.length);
      this.ais.push(ai);
    }

    ai.init(x, y, dir, aiTypeIndex, this.aiTypes[aiTypeIndex]);
    this.updateActiveCount();
    
    return ai;
  }

  update(dt) {
    for (let i = 0; i < this.ais.length; i++) {
      if (this.ais[i].active) {
        this.ais[i].animate(dt);
      }
    }
  }

  updateActiveCount() {
    this.activeCount = 0;
    for (let i = 0; i < this.ais.length; i++) {
      if (this.ais[i].active) {
        this.activeCount++;
      }
    }
  }

  getBySid(sid) {
    for (let i = 0; i < this.ais.length; i++) {
      if (this.ais[i].sid === sid && this.ais[i].active) {
        return this.ais[i];
      }
    }
    return null;
  }

  getAllActive() {
    return this.ais.filter(ai => ai.active);
  }

  clear() {
    this.ais = [];
    this.activeCount = 0;
  }
}

module.exports = AiManager;

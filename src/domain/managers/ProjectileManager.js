'use strict';

// ProjectileManager for managing projectiles
// Based on Stratums.io bundle structure

const Projectile = require('../entities/Projectile');

class ProjectileManager {
  constructor() {
    this.projectiles = [];
    this.activeCount = 0;
  }

  addProjectile(x, y, dir, range, dmg, speed, weaponIndex, owner, ignoreObj, layer) {
    let proj = null;
    
    // Try to find inactive slot
    for (let i = 0; i < this.projectiles.length; i++) {
      if (!this.projectiles[i].active) {
        proj = this.projectiles[i];
        break;
      }
    }

    // Create new projectile if needed
    if (!proj) {
      proj = new Projectile();
      proj.sid = this.projectiles.length;
      this.projectiles.push(proj);
    }

    proj.init(weaponIndex, x, y, dir, range, dmg, speed, 35, owner);
    proj.ignoreObj = ignoreObj;
    proj.layer = layer || 0;
    
    this.updateActiveCount();
    
    return proj;
  }

  update(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      if (this.projectiles[i].active) {
        const stillActive = this.projectiles[i].update(dt);
        if (!stillActive) {
          this.updateActiveCount();
        }
      }
    }
  }

  updateActiveCount() {
    this.activeCount = 0;
    for (let i = 0; i < this.projectiles.length; i++) {
      if (this.projectiles[i].active) {
        this.activeCount++;
      }
    }
  }

  getAllActive() {
    return this.projectiles.filter(proj => proj.active);
  }

  clear() {
    this.projectiles = [];
    this.activeCount = 0;
  }
}

module.exports = ProjectileManager;

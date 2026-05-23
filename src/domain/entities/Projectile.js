'use strict';

// Projectile class extracted from Stratums.io bundle-deobf.js (class aL)

class Projectile {
  constructor() {
    this.active = true;
    this.indx = 0;
    this.x = 0;
    this.y = 0;
    this.dir = 0;
    this.skipMov = true;
    this.speed = 0;
    this.dmg = 0;
    this.scale = 0;
    this.range = 0;
    this.owner = null;
  }

  init(indx, x, y, dir, range, dmg, speed, scale, owner) {
    this.active = true;
    this.indx = indx;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.skipMov = true;
    this.speed = speed;
    this.dmg = dmg;
    this.scale = scale;
    this.range = range;
    this.owner = owner;
  }

  update(dt) {
    if (this.active) {
      if (!this.skipMov) {
        const cosDir = Math.cos(this.dir);
        const sinDir = Math.sin(this.dir);
        const moveDist = this.speed * dt;
        this.x += moveDist * cosDir;
        this.y += moveDist * sinDir;
        if ((this.range -= moveDist) <= 0) {
          this.x += this.range * cosDir;
          this.y += this.range * sinDir;
          this.range = 0;
          this.active = false;
        }
      } else {
        this.skipMov = false;
      }
    }
    return this.active;
  }
}

module.exports = Projectile;

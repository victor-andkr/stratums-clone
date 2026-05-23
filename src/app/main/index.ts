'use strict';

window.loadedScript = true;
console.log('Stratums client source loaded');

// Entry point for Stratums client
// Based on bundle-deobf.js structure

const configModule = require('../config');
const config = configModule && configModule.config ? configModule.config
  : (configModule && configModule.default ? configModule.default : configModule);

const UTILS: any = require('../../shared/utils');
const { ioClient } = require('../../domain/network/ioClient');
const items = require('../../shared/constants/items');
const accessories = require('../../shared/constants/accessories');
const Player = require('../../domain/entities/Player');
const GameObject = require('../../domain/entities/GameObject');
const Projectile = require('../../domain/entities/Projectile');
const AI = require('../../domain/entities/AI');
const ObjectManager = require('../../domain/managers/ObjectManager');
const ProjectileManager = require('../../domain/managers/ProjectileManager');
const AiManager = require('../../domain/managers/AiManager');

// Initialize managers
const objectManager = new ObjectManager();
const projectileManager = new ProjectileManager();
const aiManager = new AiManager(AI);

// Game state
let localPlayer = null;
let players = [];
let gameLoopId = null;

// Initialize network connection
function initNetwork() {
  ioClient.on('connect', () => {
    console.log('Connected to Stratums.io server');
    document.getElementById('loading').style.display = 'none';
  });

  ioClient.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  ioClient.on('error', (error) => {
    console.error('Network error:', error);
  });

  // Packet handlers would be registered here
  // ioClient.on('INIT_DATA', handleInitData);
  // ioClient.on('ADD_PLAYER', handleAddPlayer);
  // etc.

  ioClient.connect();
}

// Game loop
function gameLoop(timestamp) {
  const dt = 16; // ~60fps

  // Update managers
  objectManager.update(dt);
  projectileManager.update(dt);
  aiManager.update(dt);

  // Update local player
  if (localPlayer && localPlayer.alive) {
    localPlayer.animate(dt);
  }

  // Render would happen here
  // render();

  gameLoopId = requestAnimationFrame(gameLoop);
}

// Initialize client
function init() {
  console.log('Config loaded:', config);
  console.log('Items loaded:', items);
  console.log('Accessories loaded:', accessories);

  initNetwork();
  
  // Start game loop
  gameLoopId = requestAnimationFrame(gameLoop);

  console.log('Stratums client initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};

// ==UserScript==
// @name         Visuals (Shared)
// @namespace    https://greasyfork.org/users/1064285
// @version      1.0
// @description  Visuals userscript that shares code with moomoo-clone
// @author       varkyz
// @match        *://*.moomoo.io/*
// @icon         https://moomoo.io/img/favicon.png?v=1
// @require      https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @grant        unsafeWindow
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- SHARED VISUALS MODULE ---
    // This code is shared with moomoo-clone project
    // Located at: shared/visuals/index.js
    // If running on moomoo-clone, use the shared module from window
    // Otherwise, use the embedded version

    const Visuals = window.Visuals || {
        // Storage helpers
        storage: {
            canStore: typeof Storage !== "undefined",
            saveVal(name, val) {
                if (this.canStore) {
                    localStorage.setItem(name, val);
                }
            },
            getSavedVal(name) {
                if (this.canStore) {
                    return localStorage.getItem(name);
                }
                return null;
            },
            deleteVal(name) {
                if (this.canStore) {
                    localStorage.removeItem(name);
                }
            }
        },

        // Key Overlay System
        KeyOverlay: class {
            constructor() {
                this.storageKey = "showKeysOverlay";
                this.storage = JSON.parse(Visuals.storage.getSavedVal(this.storageKey)) || {
                    keys: ["Q", "F", "V", "1", "2", "3"],
                    cps: true,
                    maxCps: true,
                    container: 200,
                    drag: { left: 20, top: 100 }
                };
                this.showKeys = true;
                this.currentCps = 0;
                this.maxCps = 0;
                this.leftCps = 0;
                this.rightCps = 0;
                this.dragging = false;
                this.offsetX = 0;
                this.offsetY = 0;
                this.element = null;
            }

            init() {
                this.createUI();
                this.bindEvents();
                this.saveStorage();
            }

            createUI() {
                const gameUI = document.getElementById("gameUI");
                if (!gameUI) return;

                const container = document.createElement("div");
                container.innerHTML = this.getHTML();
                gameUI.appendChild(container);
                this.element = document.getElementById("ks");

                // Create custom keys
                const customKeysContainer = document.getElementById("customKeys");
                if (customKeysContainer) {
                    customKeysContainer.innerHTML = "";
                    this.storage.keys.forEach(key => {
                        const el = document.createElement("div");
                        el.className = "key";
                        el.id = "key_" + key;
                        el.textContent = key;
                        customKeysContainer.appendChild(el);
                    });
                }
            }

            getHTML() {
                return `
<style>
#ks {
    position:absolute;
    left:${this.storage.drag.left}px;
    top:${this.storage.drag.top}px;
    z-index:9999;
    color:white;
    font-family:Arial;
    user-select:none;
}
#ks_bg {
    position:absolute;
    inset:0;
    background:rgba(0,0,0,0.3);
    border-radius:6px;
}
#ks_content {
    position:relative;
    padding:10px;
    width:220px;
}
.ks_row {
    display:${this.showKeys ? "flex" : "none"};
    justify-content:center;
    gap:6px;
    margin-bottom:6px;
}
.key {
    width:36px;
    height:36px;
    display:${this.showKeys ? "flex" : "none"};
    align-items:center;
    justify-content:center;
    border:1px solid white;
    border-radius:4px;
}
.key.active {
    background:white;
    color:black;
}
#mouseRow {
    display:${this.showKeys ? "flex" : "none"};
    justify-content:space-between;
    margin-top:8px;
}
.mouseBtn {
    width:48%;
    padding:4px;
    border:1px solid white;
    border-radius:4px;
    text-align:center;
}
.mouseBtn.active2 {
    background:white;
    color:black;
}
#cpsDisplay, #maxCpsDisplay {
    margin-top:6px;
}
#customKeys {
    display:${this.storage.container <= 0 || this.storage.keys.length == 0 ? "none" : this.showKeys ? "flex" : "none"};
    flex-wrap:wrap;
    gap:6px;
    margin-top:6px;
    width:${this.storage.container}px;
}
</style>

<div id="ks">
<div id="ks_bg"></div>
<div id="ks_content">
<div class="ks_row">
<div class="key" id="key_W">W</div>
</div>
<div class="ks_row">
<div class="key" id="key_A">A</div>
<div class="key" id="key_S">S</div>
<div class="key" id="key_D">D</div>
</div>

<div id="mouseRow">
<div class="mouseBtn" id="mouse_0">L: <span id="cpsL">0</span></div>
<div class="mouseBtn" id="mouse_2">R: <span id="cpsR">0</span></div>
</div>

<div id="cpsDisplay" style="display:${this.storage.cps ? this.showKeys ? "block" : "none" : "none"}">Total CPS: 0</div>
<div id="maxCpsDisplay" style="display:${this.storage.maxCps ? this.showKeys ? "block" : "none" : "none"}">MAX CPS: 0</div>

<div id="customKeys"></div>
</div>
</div>`;
            }

            bindEvents() {
                if (!this.element) return;

                // Drag with right click
                this.element.addEventListener("contextmenu", e => e.preventDefault());

                this.element.addEventListener("mousedown", e => {
                    if (e.button === 2) {
                        this.dragging = true;
                        this.offsetX = e.clientX - this.element.offsetLeft;
                        this.offsetY = e.clientY - this.element.offsetTop;
                    }
                });

                window.addEventListener("mousemove", e => {
                    if (!this.dragging) return;
                    this.element.style.left = (e.clientX - this.offsetX) + "px";
                    this.element.style.top = (e.clientY - this.offsetY) + "px";
                });

                window.addEventListener("mouseup", e => {
                    if (e.button === 2 && this.dragging) {
                        this.dragging = false;
                        this.storage.drag.left = parseFloat(this.element.style.left);
                        this.storage.drag.top = parseFloat(this.element.style.top);
                        this.saveStorage();
                    }
                });
            }

            addCPS(type) {
                this.currentCps++;
                if (type === 0) this.leftCps++;
                if (type === 2) this.rightCps++;

                const cpsDisplay = document.getElementById("cpsDisplay");
                const cpsL = document.getElementById("cpsL");
                const cpsR = document.getElementById("cpsR");
                const maxCpsDisplay = document.getElementById("maxCpsDisplay");

                if (cpsDisplay) cpsDisplay.innerText = "Total CPS: " + this.currentCps;
                if (cpsL) cpsL.innerText = this.leftCps;
                if (cpsR) cpsR.innerText = this.rightCps;

                if (this.currentCps > this.maxCps) {
                    this.maxCps = this.currentCps;
                    if (maxCpsDisplay) maxCpsDisplay.innerText = "MAX CPS: " + this.maxCps;
                }

                setTimeout(() => {
                    this.currentCps--;
                    if (type === 0) this.leftCps--;
                    if (type === 2) this.rightCps--;
                    if (cpsDisplay) cpsDisplay.innerText = "Total CPS: " + this.currentCps;
                    if (cpsL) cpsL.innerText = this.leftCps;
                    if (cpsR) cpsR.innerText = this.rightCps;
                }, 1000);
            }

            setKeyActive(key, active) {
                const el = document.getElementById("key_" + key);
                if (el) {
                    if (active) el.classList.add("active");
                    else el.classList.remove("active");
                }
            }

            setMouseActive(button, active) {
                const el = document.getElementById("mouse_" + button);
                if (el) {
                    if (active) el.classList.add("active2");
                    else el.classList.remove("active2");
                }
            }

            toggle(show) {
                this.showKeys = show;
                if (this.element) {
                    this.element.style.display = show ? "block" : "none";
                }
            }

            saveStorage() {
                Visuals.storage.saveVal(this.storageKey, JSON.stringify(this.storage));
            }

            destroy() {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }
        },

        // Altcha Bypass
        AltchaBypass: class {
            init() {
                const altcha = document.getElementById("altcha");
                const checkbox = document.getElementById("altcha_checkbox");
                const enterGame = document.getElementById("enterGame");

                if (altcha && checkbox && enterGame) {
                    enterGame.textContent = "Verifying...";
                    altcha.style.display = "none";

                    const nativeDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
                    Object.defineProperty(checkbox, "checked", {
                        configurable: true,
                        get() {
                            return nativeDescriptor.get.call(this);
                        },
                        set(value) {
                            nativeDescriptor.set.call(this, value);
                            if (value === true) {
                                enterGame.classList.remove("disabled");
                                enterGame.textContent = "Enter Game";
                            }
                        }
                    });

                    altcha.addEventListener("statechange", async event => {
                        if (event.detail?.state === "error" && typeof altcha.verify === "function")
                            await altcha.verify();
                    });

                    if (typeof altcha.verify === "function") {
                        altcha.verify();
                    }
                    checkbox.click();
                }
            }
        },

        // Custom Store Style
        CustomStyle: class {
            init() {
                const customStyle = document.createElement("style");
                customStyle.id = "customStyle";
                customStyle.innerHTML = `
#storeHolder {
    background: rgba(0, 0, 0, 0) !important;
}
#storeHolder::-webkit-scrollbar {
    width: 0px !important;
}
#storeHolder::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0) !important;
}
#storeHolder::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2) !important;
}
.storeTab {
    background: rgba(50, 50, 50, 0) !important;
    border: none !important;
    color: white !important;
    cursor: pointer !important;
}`;
                document.head.appendChild(customStyle);
            }

            destroy() {
                const style = document.getElementById("customStyle");
                if (style && style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }
        }
    };

    // --- PACKET INTERCEPTION (from MooMoo.io Script Template) ---
    // This section uses the template structure to intercept game packets
    // without rewriting the entire game bundle
    // If running on moomoo-clone, use the existing PACKETCODE and UTILS

    const PACKETCODE = window.PACKETCODE || {
        SEND: {
            aJoinReq: "P",
            kickFromClan: "Q",
            sendJoin: "b",
            createAlliance: "L",
            leaveAlliance: "N",
            storeEquipOrBuy: "c",
            sendChat: "6",
            resetMoveDir: "e",
            sendAtckState: "d",
            sendMoveDir: "a",
            sendLockDirOrAutoGather: "K",
            sendMapPing: "S",
            selectToBuild: "G",
            enterGame: "M",
            sendUpgrade: "H",
            sendDir: "D",
            pingSocket: "0"
        },
        RECEIVE: {
            setInitData: "A",
            disconnect: "B",
            setupGame: "C",
            addPlayer: "D",
            removePlayer: "E",
            updatePlayers: "a",
            updateLeaderboard: "G",
            loadGameObject: "H",
            loadAI: "I",
            animateAI: "J",
            gatherAnimation: "K",
            wiggleGameObject: "L",
            shootTurret: "M",
            updatePlayerValue: "N",
            updateHealth: "O",
            killPlayer: "P",
            killObject: "Q",
            killObjects: "R",
            updateItemCounts: "S",
            updateAge: "T",
            updateUpgrades: "U",
            updateItems: "V",
            addProjectile: "X",
            remProjectile: "Y",
            serverShutdownNotice: "Z",
            addAlliance: "g",
            deleteAlliance: "1",
            allianceNotification: "2",
            setPlayerTeam: "3",
            setAlliancePlayers: "4",
            updateStoreItems: "5",
            receiveChat: "6",
            updateMinimap: "7",
            showText: "8",
            pingMap: "9",
            pingSocketResponse: "0"
        }
    };

    const UTILS = window.UTILS || {
        lerp: (start, end, ratio) => start + (end - start) * ratio,
        getDistance: (x1, y1, x2, y2) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        },
        getDirection: (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2),
        lerpAngle: (targetAngle, currentAngle, ratio) => {
            let ta = targetAngle;
            let ca = currentAngle;
            if (Math.abs(ta - ca) > Math.PI) {
                if (ca > ta) {
                    ta += Math.PI * 2;
                } else {
                    ca += Math.PI * 2;
                }
            }
            const result = ta + (ca - ta) * ratio;
            if (result >= 0 && result <= Math.PI * 2) {
                return result;
            }
            return result % (Math.PI * 2);
        }
    };

    // --- MAIN VISUALS CONTROLLER ---
    class VisualsController {
        constructor() {
            this.keyOverlay = null;
            this.altchaBypass = null;
            this.customStyle = null;
            this.initialized = false;
            this.keysPressed = {};
        }

        init() {
            if (this.initialized) return;

            // Initialize components
            this.altchaBypass = new Visuals.AltchaBypass();
            this.altchaBypass.init();

            this.customStyle = new Visuals.CustomStyle();
            this.customStyle.init();

            // Wait for gameUI to be ready before initializing key overlay
            this.waitForGameUI();

            // Bind key events
            this.bindKeyEvents();

            this.initialized = true;
            console.log('[Visuals] Initialized');
        }

        waitForGameUI() {
            const checkInterval = setInterval(() => {
                const gameUI = document.getElementById('gameUI');
                if (gameUI) {
                    clearInterval(checkInterval);
                    this.keyOverlay = new Visuals.KeyOverlay();
                    this.keyOverlay.init();
                }
            }, 100);
        }

        bindKeyEvents() {
            window.addEventListener('keydown', (e) => {
                const key = e.key.toUpperCase();
                this.keysPressed[key] = true;
                if (this.keyOverlay) {
                    this.keyOverlay.setKeyActive(key, true);
                }
            });

            window.addEventListener('keyup', (e) => {
                const key = e.key.toUpperCase();
                this.keysPressed[key] = false;
                if (this.keyOverlay) {
                    this.keyOverlay.setKeyActive(key, false);
                }
            });

            window.addEventListener('mousedown', (e) => {
                if (this.keyOverlay) {
                    this.keyOverlay.setMouseActive(e.button, true);
                    this.keyOverlay.addCPS(e.button);
                }
            });

            window.addEventListener('mouseup', (e) => {
                if (this.keyOverlay) {
                    this.keyOverlay.setMouseActive(e.button, false);
                }
            });
        }

        destroy() {
            if (this.keyOverlay) this.keyOverlay.destroy();
            if (this.customStyle) this.customStyle.destroy();
            this.initialized = false;
        }
    }

    // --- INITIALIZATION ---
    // Initialize when DOM is ready
    function initWhenReady() {
        const visuals = new VisualsController();
        visuals.init();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWhenReady();
    } else {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    }

})();

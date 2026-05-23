// Shared Visuals Module
// This module can be used by both the moomoo-clone client and userscripts

const Visuals = {
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

// Export for different environments
if (typeof module !== "undefined" && module.exports) {
    module.exports = Visuals;
}

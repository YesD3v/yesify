/**
 * Yesify In-Page Glass Interface
 * Crafted by yes.dev
 */

(function () {
  if (window.__yesifyPanelInitialized) return;
  window.__yesifyPanelInitialized = true;

  var host = null;
  var shadow = null;
  var isOpen = false;

  function createPanel() {
    if (host) return;

    host = document.createElement("div");
    host.id = "yesify-panel-host";
    host.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483646;pointer-events:none;";

    shadow = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* Full Viewport Blurred Backdrop */
      .backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(40px) saturate(180%) brightness(0.6);
        -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 20px;
        z-index: 2147483646;
      }

      .backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }

      /* Frosted Glass Modal */
      .glass-modal {
        position: relative;
        width: 540px;
        max-width: 92vw;
        max-height: 86vh;
        background: rgba(14, 15, 20, 0.82);
        backdrop-filter: blur(36px);
        -webkit-backdrop-filter: blur(36px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Inter", sans-serif;
        user-select: none;
        transform: scale(0.96) translateY(8px);
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .backdrop.open .glass-modal {
        transform: scale(1) translateY(0);
      }

      /* Header */
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      }

      .brand-group {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .brand-circle {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px rgba(255, 255, 255, 0.25), 0 2px 6px rgba(0, 0, 0, 0.5);
        flex-shrink: 0;
      }

      .brand-plus {
        width: 16px;
        height: 16px;
        display: block;
      }

      .brand-text-block {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }

      .brand-title {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.01em;
      }

      .brand-title .part-yes {
        color: #ffffff;
      }

      .brand-title .part-ify {
        color: #52525b;
      }

      .brand-sub {
        font-size: 10.5px;
        font-weight: 500;
        color: #71717a;
      }

      /* Perfectly Centered Precision SVG Close Button */
      .close-btn {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        margin: 0;
        transition: background 0.15s ease, color 0.15s ease;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #ffffff;
      }

      .close-btn svg {
        display: block;
        width: 11px;
        height: 11px;
      }

      /* Modal Body - Clean Settings List */
      .modal-body {
        padding: 12px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: calc(86vh - 120px);
      }

      .modal-body::-webkit-scrollbar {
        width: 5px;
      }

      .modal-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 3px;
      }

      /* Clean Setting Row */
      .setting-row {
        background: transparent;
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        transition: background 0.15s ease;
      }

      .setting-row:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .setting-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
      }

      .setting-title {
        font-size: 13.5px;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: -0.01em;
      }

      .setting-desc {
        font-size: 11.5px;
        color: #94a3b8;
        line-height: 1.35;
      }

      /* Clean Pure-White iOS Toggle Switch */
      .switch {
        position: relative;
        display: inline-block;
        width: 34px;
        height: 20px;
        flex-shrink: 0;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background: #1e2026;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 20px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background: #64748b;
        transition: 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }

      /* Active State: Pure White Track + Deep Black Knob */
      input:checked + .slider {
        background: #ffffff;
        border-color: #ffffff;
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
      }

      input:checked + .slider:before {
        transform: translateX(14px);
        background: #000000;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }

      /* Minimal Footer */
      .modal-footer {
        padding: 12px 22px 14px 22px;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 10px;
        color: #64748b;
      }
    `;

    var backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.innerHTML = `
      <div class="glass-modal">
        <!-- Header -->
        <div class="modal-header">
          <div class="brand-group">
            <div class="brand-circle">
              <svg class="brand-plus" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="7.5" width="16" height="5" rx="1.5" fill="#27272a" />
                <rect x="7.5" y="2" width="5" height="16" rx="1.5" fill="#27272a" />
              </svg>
            </div>
            <div class="brand-text-block">
              <div class="brand-title"><span class="part-yes">YES</span><span class="part-ify">IFY</span></div>
              <div class="brand-sub">by yes.dev</div>
            </div>
          </div>
          <button class="close-btn" id="yesify-close-btn" aria-label="Close">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>

        <!-- Settings List -->
        <div class="modal-body">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Ad Blocker</span>
              <span class="setting-desc">Blocks Spotify audio and banner ads silently.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="panel-adblock" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Unlocked Mini Player</span>
              <span class="setting-desc">Resize the miniplayer freely without the Premium upsell paywall.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="panel-unlock-miniplayer" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Aggressive Stay-On-Top</span>
              <span class="setting-desc">Prioritizes miniplayer focus above games like Minecraft.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="panel-topmost" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Sound-Only Unfocused</span>
              <span class="setting-desc">Stops background rendering when the tab is blurred to save CPU and GPU.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="panel-unfocused" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Ultra Lightweight</span>
              <span class="setting-desc">Disables video canvas feeds, lyrics, and animations to save RAM.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="panel-lightweight">
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Motion Splash Logo</span>
              <span class="setting-desc">Shows the startup logo animation on player launch.</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="panel-splash" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <span>yes.dev &bull; v2.1.0</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(backdrop);

    var closeBtn = shadow.getElementById("yesify-close-btn");
    closeBtn.addEventListener("click", function () {
      togglePanel(false);
    });

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) {
        togglePanel(false);
      }
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) {
        togglePanel(false);
      }
    });

    wireToggles(shadow);

    var mountTarget = document.documentElement || document.body;
    mountTarget.appendChild(host);
  }

  function wireToggles(root) {
    var toggleAdblock = root.getElementById("panel-adblock");
    var toggleUnlockMiniplayer = root.getElementById("panel-unlock-miniplayer");
    var toggleTopmost = root.getElementById("panel-topmost");
    var toggleUnfocused = root.getElementById("panel-unfocused");
    var toggleLightweight = root.getElementById("panel-lightweight");
    var toggleSplash = root.getElementById("panel-splash");

    chrome.storage.local.get({
      staticrules: "enabled",
      unlockMiniplayer: true,
      aggressiveTopmost: true,
      soundOnlyUnfocused: true,
      lightweightMode: false,
      enableSplash: true
    }, function (data) {
      if (toggleAdblock) toggleAdblock.checked = data.staticrules !== "disabled";
      if (toggleUnlockMiniplayer) toggleUnlockMiniplayer.checked = data.unlockMiniplayer !== false;
      if (toggleTopmost) toggleTopmost.checked = data.aggressiveTopmost !== false;
      if (toggleUnfocused) toggleUnfocused.checked = data.soundOnlyUnfocused !== false;
      if (toggleLightweight) toggleLightweight.checked = !!data.lightweightMode;
      if (toggleSplash) toggleSplash.checked = data.enableSplash !== false;
    });

    if (toggleAdblock) {
      toggleAdblock.addEventListener("change", function () {
        var enabled = toggleAdblock.checked;
        var rulesets = ["ublock-filters", "easylist", "easyprivacy", "pgl", "urlhaus-full"];
        chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: enabled ? rulesets : [],
          disableRulesetIds: enabled ? [] : rulesets
        });
        chrome.storage.local.set({ staticrules: enabled ? "enabled" : "disabled" });
      });
    }

    if (toggleUnlockMiniplayer) {
      toggleUnlockMiniplayer.addEventListener("change", function () {
        chrome.storage.local.set({ unlockMiniplayer: toggleUnlockMiniplayer.checked });
      });
    }

    if (toggleTopmost) {
      toggleTopmost.addEventListener("change", function () {
        chrome.storage.local.set({ aggressiveTopmost: toggleTopmost.checked });
      });
    }

    if (toggleUnfocused) {
      toggleUnfocused.addEventListener("change", function () {
        chrome.storage.local.set({ soundOnlyUnfocused: toggleUnfocused.checked });
      });
    }

    if (toggleLightweight) {
      toggleLightweight.addEventListener("change", function () {
        chrome.storage.local.set({ lightweightMode: toggleLightweight.checked });
      });
    }

    if (toggleSplash) {
      toggleSplash.addEventListener("change", function () {
        chrome.storage.local.set({ enableSplash: toggleSplash.checked });
      });
    }
  }

  function togglePanel(forcedState) {
    createPanel();
    var backdrop = shadow.querySelector(".backdrop");
    if (!backdrop) return;

    if (typeof forcedState === "boolean") {
      isOpen = forcedState;
    } else {
      isOpen = !isOpen;
    }

    if (isOpen) {
      backdrop.classList.add("open");
    } else {
      backdrop.classList.remove("open");
    }
  }

  // Listen for message from background service worker
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === "TOGGLE_YESIFY_PANEL") {
      togglePanel();
      sendResponse({ success: true, isOpen: isOpen });
    }
  });

  // Hotkey listener: Alt+S or Alt+Y
  window.addEventListener("keydown", function (e) {
    if (e.altKey && (e.key === "y" || e.key === "Y" || e.key === "s" || e.key === "S")) {
      e.preventDefault();
      togglePanel();
    }
  });
})();

/**
 * Yesify Content Script - Spotify Bridge
 * Crafted by yes.dev
 */

(function () {
  console.log("%c[Yesify by yes.dev]%c Bridge active on Spotify Web Player", "color:#ffd700;font-weight:bold;", "color:#ffffff;");

  var SPOTIFY_DESKTOP_PANEL_ID = "Desktop_PanelContainer_Id";
  var SPOTIFY_AD_BREAK_SNIPPET = "Your music will continue after the break";

  var mutifyAdUiLastState = null;
  var mutifyBodyObserver = null;
  var mutifyDebounceTimer = null;

  // Inject helper scripts into page MAIN world
  function injectScript(scriptName) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = chrome.runtime.getURL(scriptName);
      s.onload = function () {
        this.parentNode.removeChild(this);
        resolve(true);
      };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  async function initInjections() {
    await injectScript("hook.js");
    await injectScript("injected/yesify_core.js");
  }

  initInjections();

  // ----------------------------------------------------
  // Settings Synchronization Bridge (Extension -> MAIN world)
  // ----------------------------------------------------
  function sendSettingsToPage() {
    chrome.storage.local.get({
      unlockMiniplayer: true,
      aggressiveTopmost: true,
      lightweightMode: false,
      soundOnlyUnfocused: true
    }, function (data) {
      window.postMessage({
        __yesify: "settings",
        settings: {
          unlockMiniplayer: data.unlockMiniplayer !== false,
          aggressiveTopmost: data.aggressiveTopmost !== false,
          lightweightMode: !!data.lightweightMode,
          soundOnlyUnfocused: data.soundOnlyUnfocused !== false
        }
      }, "*");
    });
  }

  sendSettingsToPage();

  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.unlockMiniplayer || changes.aggressiveTopmost || changes.lightweightMode || changes.soundOnlyUnfocused) {
      sendSettingsToPage();
    }
  });

  window.addEventListener("message", function (e) {
    if (e.data && e.data.__yesify === "core-ready") {
      sendSettingsToPage();
    }
  });

  // ----------------------------------------------------
  // Dynamic DNR Session Rule Management for Audio Ads
  // ----------------------------------------------------
  function updateDNRRules(adIdJson) {
    var adIds = [];
    try {
      adIds = JSON.parse(adIdJson);
    } catch (e) {
      return;
    }

    if (!Array.isArray(adIds) || adIds.length === 0) return;

    // Increment blocked ads count
    chrome.storage.local.get({ removedcount: 0, blockedCount: 0 }, function (res) {
      var newRemoved = Number(res.removedcount || 0) + 1;
      var newTotal = Number(res.blockedCount || 0) + 1;
      chrome.storage.local.set({
        removedcount: newRemoved,
        blockedCount: newTotal
      });
    });

    var baseId = 70000;
    var newRules = adIds.flatMap(function (id, idx) {
      return [
        {
          id: baseId + (idx * 3) + 1,
          priority: 100000,
          action: {
            type: "redirect",
            redirect: {
              extensionPath: "/web_accessible_resources/noop-1s.mp4"
            }
          },
          condition: {
            urlFilter: `*://${id}*`,
            resourceTypes: ["media"],
            initiatorDomains: ["open.spotify.com"]
          }
        },
        {
          id: baseId + (idx * 3) + 2,
          priority: 100000,
          action: {
            type: "modifyHeaders",
            responseHeaders: [
              {
                header: "Access-Control-Allow-Origin",
                operation: "set",
                value: "*"
              }
            ]
          },
          condition: {
            urlFilter: `*://${id}*`,
            resourceTypes: ["media"],
            initiatorDomains: ["open.spotify.com"]
          }
        }
      ];
    });

    chrome.storage.local.set({
      newRules: newRules,
      update_dnr: performance.now()
    });
  }

  // Observe attribute changes on document.body for ad_content_id
  function observeBodyAdAttributes() {
    if (!document.body) {
      setTimeout(observeBodyAdAttributes, 500);
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "attributes" && m.attributeName === "ad_content_id") {
          var val = document.body.getAttribute("ad_content_id");
          if (val && val !== "[]") {
            updateDNRRules(val);
          }
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["ad_content_id"]
    });
  }

  observeBodyAdAttributes();

  // ----------------------------------------------------
  // Mutify Panel Audio Fallback
  // ----------------------------------------------------
  function spotifyPanelIndicatesAdBreak(panel) {
    if (!panel) return false;
    if (panel.textContent && panel.textContent.includes(SPOTIFY_AD_BREAK_SNIPPET)) return true;
    if (panel.querySelector('[data-testid="ad-companion-card"]')) return true;
    if (panel.querySelector('[data-testid="ad-companion-card-tagline"]')) return true;
    if (panel.querySelector('a[data-context-item-type="ad"]')) return true;
    return false;
  }

  function syncMutifyTabWithPanel() {
    var panel = document.getElementById(SPOTIFY_DESKTOP_PANEL_ID);
    var adActive = spotifyPanelIndicatesAdBreak(panel);
    if (adActive === mutifyAdUiLastState) return;

    mutifyAdUiLastState = adActive;
    if (adActive) {
      chrome.runtime.sendMessage({ muteTab: true });
      console.log("[Yesify] Tab muted for ad break");
    } else {
      chrome.runtime.sendMessage({ Unmute: true });
      console.log("[Yesify] Tab unmuted, music playing");
    }
  }

  function initMutifyObserver() {
    if (!document.body) {
      setTimeout(initMutifyObserver, 1000);
      return;
    }

    if (mutifyBodyObserver) return;
    mutifyBodyObserver = new MutationObserver(function () {
      if (mutifyDebounceTimer !== null) clearTimeout(mutifyDebounceTimer);
      mutifyDebounceTimer = setTimeout(function () {
        mutifyDebounceTimer = null;
        syncMutifyTabWithPanel();
      }, 500);
    });

    mutifyBodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });

    syncMutifyTabWithPanel();
  }

  initMutifyObserver();
})();

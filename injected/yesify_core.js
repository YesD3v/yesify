/**
 * Yesify Core Engine (runs in Spotify MAIN world)
 * Crafted by yes.dev
 *
 * 1. Native Miniplayer Unlock:
 *    - Completely suppresses the "Premium" upsell overlay when resized below 300px.
 *    - Preserves Spotify's native stock player styling (no glassmorphism).
 *    - Never touches or edits the main Spotify page DOM.
 *    - Aggressive stay-on-top prioritization over games like Minecraft.
 * 2. Ad Blocker (Blockify):
 *    - Intercepts Spotify player state and WebSockets to detect ad IDs and redirect them.
 *    - Controller fallback for skip-on-play.
 */

(function () {
  "use strict";
  if (window.__yesifyCore) return;
  window.__yesifyCore = true;

  var LOG = "[Yesify]";
  var settings = {
    unlockMiniplayer: true,
    aggressiveTopmost: true
  };

  /* ------------------------------------------------------------------ */
  /* Settings Bridge                                                    */
  /* ------------------------------------------------------------------ */
  var pip = null; // { win, refresh }

  window.addEventListener("message", function (e) {
    if (e.source !== window || !e.data || e.data.__yesify !== "settings") return;
    var s = e.data.settings || {};
    if (typeof s.unlockMiniplayer === "boolean") settings.unlockMiniplayer = s.unlockMiniplayer;
    if (typeof s.aggressiveTopmost === "boolean") settings.aggressiveTopmost = s.aggressiveTopmost;
    if (pip) pip.refresh();
  });

  window.postMessage({ __yesify: "core-ready" }, "*");

  /* ------------------------------------------------------------------ */
  /* Webpack Chunk Access                                               */
  /* ------------------------------------------------------------------ */
  var wpRequire = null;
  function getWebpackRequire() {
    if (wpRequire) return wpRequire;
    var chunks = window.webpackChunkclient_web;
    if (!chunks || typeof chunks.push !== "function") return null;
    try {
      chunks.push([["yesify-" + Date.now()], {}, function (req) { wpRequire = req; }]);
    } catch (e) {}
    return wpRequire;
  }

  /* ------------------------------------------------------------------ */
  /* 1. Native Miniplayer Unlock                                        */
  /* ------------------------------------------------------------------ */
  var classes = {
    upsellContainer: "gJ2Pte0tSDq7mRhzL_cb",
    wrapper: "EUJVBvHdIVLdTaMk7_Ed",
    container: "DRyw03q7yEnJulWzspWT"
  };
  var classesFromBuild = false;

  function discoverClasses() {
    if (classesFromBuild) return true;
    var req = getWebpackRequire();
    if (!req || !req.m) return false;
    var hit = false;
    for (var id in req.m) {
      var src;
      try { src = Function.prototype.toString.call(req.m[id]); } catch (e) { continue; }
      if (src.length > 6000) continue;
      if (src.indexOf('upsellContainer:"') === -1 && src.indexOf('resizeHandle:"') === -1) continue;
      var re = /([A-Za-z_$][\w$]*):"([A-Za-z0-9_-]+)"/g, m;
      while ((m = re.exec(src))) {
        if (Object.prototype.hasOwnProperty.call(classes, m[1])) {
          classes[m[1]] = m[2];
          hit = true;
        }
      }
    }
    if (hit) {
      classesFromBuild = true;
      console.log(LOG, "miniplayer classes discovered:", classes);
    }
    return hit;
  }

  function discoverUpsellFromCss(doc) {
    var links = [].slice.call(doc.querySelectorAll('link[rel="stylesheet"][href*="pip-mini-player"]'))
      .concat([].slice.call(document.querySelectorAll('link[rel="stylesheet"][href*="pip-mini-player"]')));
    if (!links.length) return Promise.resolve(null);
    return fetch(links[0].href).then(function (r) { return r.text(); }).then(function (css) {
      var m = css.match(/\(height<300px\)\s*or\s*\(width<300px\)\s*\{\s*\.([A-Za-z0-9_-]+)\s*\{\s*display:\s*block/);
      return m ? m[1] : null;
    }).catch(function () { return null; });
  }

  function pipCss() {
    var c = classes;
    var css = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
      }
    `;

    if (settings.unlockMiniplayer) {
      css += `
        .${c.upsellContainer},
        [class*="upsellContainer"],
        [class*="upsellContent"],
        div:has(> [class*="upsellContent"]),
        div:has(> [class*="upsellButtons"]),
        div:has(a[href*="/premium"]),
        div:has(button[aria-label*="Premium"]) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
        }

        /* Ensure container stays full-size at any micro resolution */
        .${c.container}, [class*="container"] {
          height: 100% !important;
          max-height: 100% !important;
        }
      `;
    }

    return css;
  }

  function hideUpsellElements(doc) {
    if (!settings.unlockMiniplayer) return;
    try {
      var upsellEl = doc.querySelector("." + classes.upsellContainer) ||
                     doc.querySelector('[class*="upsellContainer"]');
      if (upsellEl) {
        upsellEl.style.setProperty("display", "none", "important");
        upsellEl.style.setProperty("visibility", "hidden", "important");
      }

      var divs = doc.querySelectorAll("div");
      for (var i = 0; i < divs.length; i++) {
        var d = divs[i];
        if (d.textContent && (d.textContent.includes("Premium") || d.textContent.includes("upsell"))) {
          if (d.querySelector("button") || d.querySelector("a")) {
            var rect = d.getBoundingClientRect();
            if (rect.width > 150 && rect.height > 80 && (d.style.position === "absolute" || d.className.includes("upsell"))) {
              d.style.setProperty("display", "none", "important");
            }
          }
        }
      }
    } catch (e) {}
  }

  function enhanceMiniplayer(win) {
    if (!win || win.__yesify) return;
    win.__yesify = true;
    var doc = win.document;

    var style = doc.createElement("style");
    style.id = "yesify-miniplayer";

    function mount() {
      if (!style.isConnected) (doc.head || doc.documentElement).appendChild(style);
    }

    function refresh() {
      style.textContent = pipCss();
      mount();
      hideUpsellElements(doc);
    }

    // Aggressive stay-on-top keep-alive for games
    function setupStayOnTop() {
      if (!settings.aggressiveTopmost) return;
      win.addEventListener("blur", function () {
        if (!settings.aggressiveTopmost || win.closed) return;
        setTimeout(function () {
          if (!win.closed && settings.aggressiveTopmost) {
            win.focus();
          }
        }, 120);
      });
    }

    setupStayOnTop();

    // DOM Mutation observer inside PiP
    var queued = 0;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = win.requestAnimationFrame(function () {
        queued = 0;
        mount();
        hideUpsellElements(doc);
      });
    });

    observer.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    discoverClasses();
    refresh();

    // Poll briefly for late-loaded class map
    var tries = 0;
    var retry = setInterval(function () {
      tries++;
      if (discoverClasses() || tries >= 20) {
        clearInterval(retry);
        refresh();
        if (!classesFromBuild) {
          discoverUpsellFromCss(doc).then(function (cls) {
            if (cls) {
              classes.upsellContainer = cls;
              console.log(LOG, "upsell class from stylesheet:", cls);
              refresh();
            }
          });
        }
      }
    }, 250);

    pip = { win: win, refresh: refresh };

    win.addEventListener("pagehide", function () {
      observer.disconnect();
      clearInterval(retry);
      if (pip && pip.win === win) pip = null;
    });

    console.log(LOG, "Native miniplayer unlocked (stock player appearance preserved)");
  }

  // Intercept Document Picture-in-Picture
  var dpip = window.documentPictureInPicture;
  if (dpip) {
    var origRequestWindow = dpip.requestWindow;
    if (origRequestWindow) {
      dpip.requestWindow = async function () {
        var win = await origRequestWindow.apply(this, arguments);
        enhanceMiniplayer(win);
        return win;
      };
    }
    dpip.addEventListener("enter", function (e) { enhanceMiniplayer(e.window); });
    if (dpip.window) enhanceMiniplayer(dpip.window);
  }

  // Keep PiP window focused when main Spotify window loses focus (e.g. playing Minecraft)
  window.addEventListener("blur", function () {
    if (settings.aggressiveTopmost && pip && pip.win && !pip.win.closed) {
      pip.win.focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* 2. Ad blocking (Blockify)                                          */
  /* ------------------------------------------------------------------ */
  var MAX_AD_CONTENT_IDS = 15;

  function recordAdIds(stateMachine) {
    if (!stateMachine || !stateMachine.tracks || !document.body) return;
    var ids = [];
    stateMachine.tracks.forEach(function (track) {
      if (track && track.content_type === "AD") {
        var files = track.manifest && track.manifest.file_ids_mp3;
        if (files) files.forEach(function (f) { ids.push(f.file_id); });
      }
    });
    if (!ids.length) return;

    var prev = [];
    try { prev = JSON.parse(document.body.getAttribute("ad_content_id") || "[]"); } catch (e) {}
    var merged = Array.from(new Set(prev.concat(ids))).slice(-MAX_AD_CONTENT_IDS);
    var value = JSON.stringify(merged);
    if (document.body.getAttribute("ad_content_id") !== value) {
      document.body.setAttribute("ad_content_id", value);
    }
  }

  var originalFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var p = originalFetch.call(window, input, init);
    if (url.indexOf("/state") !== -1) {
      p.then(function (res) {
        res.clone().json().then(function (data) {
          if (data && data.state_machine) recordAdIds(data.state_machine);
        }).catch(function () {});
      }).catch(function () {});
    }
    return p;
  };

  if (typeof wsHook !== "undefined") {
    wsHook.after = function (messageEvent) {
      return new Promise(function (resolve) {
        try {
          var data = JSON.parse(messageEvent.data);
          (data.payloads || []).forEach(function (p) {
            if (p && p.type === "replace_state" && p.state_machine) recordAdIds(p.state_machine);
          });
        } catch (e) {}
        resolve(messageEvent);
      });
    };
  }

  function findController() {
    var req = getWebpackRequire();
    if (!req || !req.c) return null;
    var seen = new Set();
    function deepFind(obj, depth) {
      if (!obj || typeof obj !== "object" || depth > 6 || seen.has(obj)) return null;
      seen.add(obj);
      if (obj === window || obj === document || obj instanceof Node) return null;
      try {
        if (typeof obj.nextTrack === "function" && typeof obj.pause === "function" && typeof obj.resume === "function") return obj;
      } catch (e) { return null; }
      for (var k in obj) {
        var found = null;
        try { found = deepFind(obj[k], depth + 1); } catch (e) {}
        if (found) return found;
      }
      return null;
    }
    for (var id in req.c) {
      try {
        var found = deepFind(req.c[id].exports, 0);
        if (found) return found;
      } catch (e) {}
    }
    return null;
  }

  var controllerTries = 0;
  function armAdFallback() {
    var controller = findController();
    if (!controller || !controller._streamer) {
      if (++controllerTries < 30) setTimeout(armAdFallback, 2000);
      return;
    }
    controller._streamer.on("track_loaded", function (e) {
      var track = e && e.data && e.data.track;
      if (!track || !track.isAd) return;
      var known = [];
      try { known = JSON.parse(document.body.getAttribute("ad_content_id") || "[]"); } catch (err) {}
      if (known.indexOf(track.fileId) === -1) {
        controller._streamer._listPlayer.next("trackdone");
      }
    });
  }

  setTimeout(armAdFallback, 5000);
})();

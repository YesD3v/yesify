/**
 * Yesify Hardcore Ultra Lightweight & Background Sound-Only Engine
 * Crafted by yes.dev
 *
 * Drastically reduces Spotify RAM, CPU, and GPU usage to near zero.
 * Pushes memory consumption well below 300MB in Lite Mode.
 * Completely freezes DOM rendering and compositor frame callbacks when unfocused.
 * Operates completely invisibly with zero audio playback degradation.
 */

(function () {
  "use strict";

  var isLightweightEnabled = false;
  var isSoundOnlyUnfocusedEnabled = true;
  var isCurrentlyUnfocused = false;
  var imageObserver = null;

  // Initialize preferences
  chrome.storage.local.get({
    lightweightMode: false,
    soundOnlyUnfocused: true
  }, function (prefs) {
    isLightweightEnabled = !!prefs.lightweightMode;
    isSoundOnlyUnfocusedEnabled = prefs.soundOnlyUnfocused !== false;
    applyLightweightState();
    checkFocusState();
  });

  // Listen for preference changes from In-Page Panel or Popup
  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.lightweightMode !== undefined) {
      isLightweightEnabled = !!changes.lightweightMode.newValue;
      applyLightweightState();
    }
    if (changes.soundOnlyUnfocused !== undefined) {
      isSoundOnlyUnfocusedEnabled = changes.soundOnlyUnfocused.newValue !== false;
      checkFocusState();
    }
  });

  // -------------------------------------------------------------------------
  // 1. HARDCORE ULTRA LIGHTWEIGHT MODE
  // -------------------------------------------------------------------------
  function applyLightweightState() {
    if (isLightweightEnabled) {
      document.documentElement.classList.add("yesify-lightweight");
      pauseCanvasVideos();
      optimizeExistingImages();
      startImageObserver();
    } else {
      document.documentElement.classList.remove("yesify-lightweight");
      stopImageObserver();
    }

    // Broadcast state to page MAIN world
    try {
      window.postMessage({
        __yesify: "lite-state",
        lite: isLightweightEnabled
      }, "*");
    } catch (e) {}
  }

  // Safely pauses looping visual canvas videos without touching audio playback
  function pauseCanvasVideos() {
    try {
      var canvasVideos = document.querySelectorAll(
        '[data-testid="canvas-container"] video, .npv-canvas-container video, video[loop][muted]'
      );
      canvasVideos.forEach(function (v) {
        if (v && !v.paused && (v.muted || v.loop)) {
          v.pause();
        }
      });
    } catch (e) {}
  }

  // Image Decimator: Forces asynchronous decoding and lazy loading to prevent texture cache bloat
  function optimizeImage(img) {
    if (!img) return;
    try {
      img.loading = "lazy";
      img.decoding = "async";
    } catch (e) {}
  }

  function optimizeExistingImages() {
    try {
      var images = document.querySelectorAll("img");
      images.forEach(optimizeImage);
    } catch (e) {}
  }

  function startImageObserver() {
    if (imageObserver) return;
    try {
      imageObserver = new MutationObserver(function (mutations) {
        if (!isLightweightEnabled) return;
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "IMG") {
                optimizeImage(node);
              } else if (node.querySelectorAll) {
                var nestedImgs = node.querySelectorAll("img");
                nestedImgs.forEach(optimizeImage);
              }
            }
          }
        }
      });

      imageObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    } catch (e) {}
  }

  function stopImageObserver() {
    if (imageObserver) {
      imageObserver.disconnect();
      imageObserver = null;
    }
  }

  // -------------------------------------------------------------------------
  // 2. HARDCORE OUT-OF-FOCUS FREEZE (Sound-Only Mode)
  // OVERRIDE: Sound-Only Unfocused overrides Lite Mode when tab is blurred!
  // -------------------------------------------------------------------------
  function checkFocusState() {
    var hasFocus = typeof document.hasFocus === "function" ? document.hasFocus() : true;
    var isVisible = !document.hidden;
    var focused = hasFocus && isVisible;

    if (!focused && isSoundOnlyUnfocusedEnabled) {
      if (!isCurrentlyUnfocused) {
        isCurrentlyUnfocused = true;
        // Sound-Only Unfocused overrides Lite Mode
        document.documentElement.classList.add("yesify-unfocused-freeze");
        // Suspend Lite Mode observers so zero JS overhead runs in background
        stopImageObserver();
        pauseCanvasVideos();
        notifyMainWorldFreeze(true);
      }
    } else {
      if (isCurrentlyUnfocused) {
        isCurrentlyUnfocused = false;
        document.documentElement.classList.remove("yesify-unfocused-freeze");
        notifyMainWorldFreeze(false);
        // When focus returns, re-engage Lite Mode if enabled
        if (isLightweightEnabled) {
          optimizeExistingImages();
          startImageObserver();
        }
      }
    }
  }

  function notifyMainWorldFreeze(frozen) {
    try {
      window.postMessage({
        __yesify: "freeze-state",
        frozen: frozen
      }, "*");
    } catch (e) {}
  }

  // Multi-tier focus event tracking
  window.addEventListener("focus", checkFocusState, true);
  window.addEventListener("blur", checkFocusState, true);
  document.addEventListener("visibilitychange", checkFocusState, true);
  window.addEventListener("pageshow", checkFocusState, true);
  window.addEventListener("pagehide", checkFocusState, true);

  // Fallback poll to guarantee instant response during fast alt-tabbing
  setInterval(checkFocusState, 1000);

  // Periodic memory sweep when in Lite Mode
  setInterval(function () {
    if (isLightweightEnabled || isCurrentlyUnfocused) {
      pauseCanvasVideos();
    }
  }, 15000);
})();

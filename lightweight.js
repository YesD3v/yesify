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
      terminateVideoDecoders();
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

  // Actively terminates any running video decoders to free GPU & RAM video buffers
  function terminateVideoDecoders() {
    try {
      var videos = document.querySelectorAll("video");
      videos.forEach(function (v) {
        if (!v.id || !v.id.includes("yesify")) {
          v.pause();
          v.preload = "none";
          // If in lightweight mode, clear the video stream to release decoder hardware memory
          if (isLightweightEnabled) {
            v.removeAttribute("src");
            try { v.load(); } catch (err) {}
          }
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
              if (node.tagName === "VIDEO") {
                node.pause();
                node.preload = "none";
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
  // -------------------------------------------------------------------------
  function checkFocusState() {
    var hasFocus = typeof document.hasFocus === "function" ? document.hasFocus() : true;
    var isVisible = !document.hidden;
    var focused = hasFocus && isVisible;

    if (!focused && isSoundOnlyUnfocusedEnabled) {
      if (!isCurrentlyUnfocused) {
        isCurrentlyUnfocused = true;
        document.documentElement.classList.add("yesify-unfocused-freeze");
        terminateVideoDecoders();
        notifyMainWorldFreeze(true);
      }
    } else {
      if (isCurrentlyUnfocused) {
        isCurrentlyUnfocused = false;
        document.documentElement.classList.remove("yesify-unfocused-freeze");
        notifyMainWorldFreeze(false);
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
      terminateVideoDecoders();
    }
  }, 15000);
})();

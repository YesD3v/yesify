/**
 * Yesify Ultra Lightweight & Background Sound-Only Engine
 * Crafted by yes.dev
 * Drastically reduces Spotify RAM, CPU, and GPU usage to near zero.
 * When unfocused, halts all DOM rendering and video decoders while audio plays cleanly.
 * NOTE: Operates completely invisibly without editing or injecting elements into the main page.
 */

(function () {
  var isLightweightEnabled = false;
  var isSoundOnlyUnfocusedEnabled = true;
  var isCurrentlyUnfocused = false;

  chrome.storage.local.get({
    lightweightMode: false,
    soundOnlyUnfocused: true
  }, function (prefs) {
    isLightweightEnabled = prefs.lightweightMode;
    isSoundOnlyUnfocusedEnabled = prefs.soundOnlyUnfocused;
    applyLightweightState();
    checkFocusState();
  });

  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.lightweightMode !== undefined) {
      isLightweightEnabled = changes.lightweightMode.newValue;
      applyLightweightState();
    }
    if (changes.soundOnlyUnfocused !== undefined) {
      isSoundOnlyUnfocusedEnabled = changes.soundOnlyUnfocused.newValue;
      checkFocusState();
    }
  });

  function applyLightweightState() {
    if (isLightweightEnabled) {
      document.documentElement.classList.add("yesify-lightweight");
      pauseBackgroundVideos();
    } else {
      document.documentElement.classList.remove("yesify-lightweight");
    }
  }

  function pauseBackgroundVideos() {
    try {
      var videos = document.querySelectorAll("video");
      videos.forEach(function (v) {
        if (!v.paused && !v.id.includes("yesify")) {
          v.pause();
        }
      });
    } catch (e) {}
  }

  // -------------------------------------------------------------------
  // SOUND-ONLY WHEN UNFOCUSED (Auto Freeze Background Rendering)
  // -------------------------------------------------------------------
  function checkFocusState() {
    var hasFocus = document.hasFocus();
    var isVisible = !document.hidden;
    var focused = hasFocus && isVisible;

    if (!focused && isSoundOnlyUnfocusedEnabled) {
      if (!isCurrentlyUnfocused) {
        isCurrentlyUnfocused = true;
        document.documentElement.classList.add("yesify-unfocused-freeze");
        pauseBackgroundVideos();
      }
    } else {
      if (isCurrentlyUnfocused) {
        isCurrentlyUnfocused = false;
        document.documentElement.classList.remove("yesify-unfocused-freeze");
      }
    }
  }

  window.addEventListener("focus", checkFocusState);
  window.addEventListener("blur", checkFocusState);
  document.addEventListener("visibilitychange", checkFocusState);

  setInterval(checkFocusState, 2000);
})();

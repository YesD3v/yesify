/**
 * Yesify Popup Controller
 * Crafted by yes.dev
 */

document.addEventListener("DOMContentLoaded", function () {
  var toggleAdblock = document.getElementById("toggle-adblock");
  var toggleUnlockMiniplayer = document.getElementById("toggle-unlock-miniplayer");
  var toggleTopmost = document.getElementById("toggle-topmost");
  var toggleUnfocused = document.getElementById("toggle-unfocused");
  var toggleLightweight = document.getElementById("toggle-lightweight");
  var toggleSplash = document.getElementById("toggle-splash");

  // Load Saved Preferences
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

  // Toggles
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
});

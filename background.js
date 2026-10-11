/**
 * Yesify Background Service Worker
 * Crafted by yes.dev
 */

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.storage.local.set({
      installdate: Date.now(),
      staticrules: "enabled",
      exceptions: [],
      removedcount: 0,
      blockedCount: 0,
      unlockMiniplayer: true,
      aggressiveTopmost: true,
      lightweightMode: false,
      soundOnlyUnfocused: true,
      enableSplash: true
    });
  }
});

// Action Click: Toggle the in-page iOS 26 Glass UI on Spotify
chrome.action.onClicked.addListener(function (tab) {
  if (tab && tab.url && (tab.url.includes("open.spotify.com") || tab.url.includes("spotify.com"))) {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_YESIFY_PANEL" });
  } else {
    chrome.tabs.query({ url: "*://*.spotify.com/*" }, function (tabs) {
      if (tabs && tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true }, function () {
          if (tabs[0].windowId) chrome.windows.update(tabs[0].windowId, { focused: true });
          setTimeout(function () {
            chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_YESIFY_PANEL" });
          }, 350);
        });
      } else {
        chrome.tabs.create({ url: "https://open.spotify.com/" });
      }
    });
  }
});

// Keyboard command shortcut (Alt+S)
chrome.commands.onCommand.addListener(function (command) {
  if (command === "open_spotify") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes("spotify.com")) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_YESIFY_PANEL" });
      } else {
        chrome.tabs.create({ url: "https://open.spotify.com/" });
      }
    });
  }
});

// Tab Audio Muting / Unmuting & Message Relay
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.muteTab && sender.tab) {
    chrome.tabs.update(sender.tab.id, { muted: true });
    sendResponse({ success: true });
  } else if (request.Unmute && sender.tab) {
    chrome.tabs.update(sender.tab.id, { muted: false });
    sendResponse({ success: true });
  } else if (request.action === "GET_SPOTIFY_TAB") {
    chrome.tabs.query({ url: "*://open.spotify.com/*" }, function (tabs) {
      sendResponse({ tab: tabs && tabs.length > 0 ? tabs[0] : null });
    });
    return true;
  }
});

// Watch for DNR session rule updates
chrome.storage.onChanged.addListener(function (changes) {
  if (changes.update_dnr) {
    chrome.declarativeNetRequest.getSessionRules(function (currentRules) {
      var existingIds = currentRules.map(function (r) { return r.id; });
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: existingIds
      }, function () {
        chrome.storage.local.get(["newRules"], function (res) {
          if (res.newRules && Array.isArray(res.newRules)) {
            chrome.declarativeNetRequest.updateSessionRules({
              addRules: res.newRules
            });
          }
        });
      });
    });
  }
});

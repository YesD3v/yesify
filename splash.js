/**
 * Yesify Brand Motion Splash - Monochrome Edition
 * Crafted by yes.dev
 *
 * Cinematic large splash screen with:
 * - A bold 144px crisp white circle with a prominent 80px dark gray "+" in the center
 * - Clean large bold math font text below: (white)YES(dark gray)IFY
 * - Subtitle: by yes.dev in sleek dark gray
 *
 * Uses Shadow DOM for total isolation from Spotify's styles.
 */

(function () {
  if (window.__yesifySplashActive) return;
  window.__yesifySplashActive = true;

  function runSplash() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ enableSplash: true }, function (data) {
        if (data.enableSplash !== false) {
          showSplash();
        }
      });
    } else {
      showSplash();
    }
  }

  function showSplash() {
    var existing = document.getElementById("yesify-splash-host");
    if (existing) existing.remove();

    var host = document.createElement("div");
    host.id = "yesify-splash-host";
    host.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:auto;";

    var shadow = host.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .splash-overlay {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: #000000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        user-select: none;
        cursor: pointer;
        opacity: 1;
        transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .splash-overlay.dismiss {
        opacity: 0;
        transform: scale(1.025);
        pointer-events: none;
      }

      .splash-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      /* Large Prominent White Circle with Bold Dark Gray Plus */
      .circle {
        width: 144px;
        height: 144px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 0 50px rgba(255, 255, 255, 0.25), 0 16px 40px rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: circlePop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards;
      }

      .plus-svg {
        width: 80px;
        height: 80px;
        display: block;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
      }

      /* Clean Bold Math Font: (white)YES(dark gray)IFY */
      .brand-title {
        margin-top: 32px;
        font-family: "Cambria Math", "STIX Two Math", "Latin Modern Math", "Georgia", "Times New Roman", serif;
        font-size: 56px;
        font-weight: 800;
        letter-spacing: 0.1em;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(18px);
        animation: textRise 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards;
      }

      .part-yes {
        color: #ffffff;
        text-shadow: 0 0 24px rgba(255, 255, 255, 0.4);
      }

      .part-ify {
        color: #52525b;
        text-shadow: 0 0 20px rgba(82, 82, 91, 0.5);
      }

      .brand-sub {
        margin-top: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.36em;
        text-transform: uppercase;
        color: #71717a;
        opacity: 0;
        transform: translateY(8px);
        animation: subFade 0.55s ease-out 0.65s forwards;
      }

      @keyframes circlePop {
        0% {
          transform: scale(0.2) rotate(-10deg);
          opacity: 0;
        }
        70% {
          transform: scale(1.06) rotate(2deg);
          opacity: 1;
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      @keyframes textRise {
        0% {
          opacity: 0;
          transform: translateY(18px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes subFade {
        0% {
          opacity: 0;
          transform: translateY(8px);
        }
        100% {
          opacity: 0.95;
          transform: translateY(0);
        }
      }
    `;

    var container = document.createElement("div");
    container.className = "splash-overlay";
    container.innerHTML = `
      <div class="splash-content">
        <!-- 144px White Circle with 80px Bold Dark Gray Plus -->
        <div class="circle">
          <svg class="plus-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="darkGrayGradLg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#3f3f46" />
                <stop offset="50%" stop-color="#27272a" />
                <stop offset="100%" stop-color="#18181b" />
              </linearGradient>
            </defs>
            <!-- Horizontal Bar: 72px wide, 24px high -->
            <rect x="4" y="28" width="72" height="24" rx="7" fill="url(#darkGrayGradLg)" />
            <!-- Vertical Bar: 24px wide, 72px high -->
            <rect x="28" y="4" width="24" height="72" rx="7" fill="url(#darkGrayGradLg)" />
          </svg>
        </div>

        <!-- Clean Bold Math Font: (white)YES(dark gray)IFY -->
        <div class="brand-title">
          <span class="part-yes">YES</span><span class="part-ify">IFY</span>
        </div>
        <div class="brand-sub">by yes.dev</div>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);

    function dismiss() {
      if (container.classList.contains("dismiss")) return;
      container.classList.add("dismiss");
      setTimeout(function () {
        if (host && host.parentNode) {
          host.parentNode.removeChild(host);
        }
      }, 550);
    }

    container.addEventListener("click", dismiss);

    var target = document.documentElement || document.body;
    target.appendChild(host);

    setTimeout(dismiss, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSplash);
  } else {
    runSplash();
  }

  window.addEventListener("message", function (e) {
    if (e.data && e.data.action === "YESIFY_PREVIEW_SPLASH") {
      showSplash();
    }
  });
})();

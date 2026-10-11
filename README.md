# Yesify (by yes.dev)

> **The Ultimate Spotify Experience** - Merging Dhanur's Blockify ad-blocking engine with an unlocked resizable Mini Player, aggressive stay-on-top Game Mode for Minecraft, ultra-lightweight sound-only background player, and a custom motion animation loading logo.

---

## ⚡ What's New in Yesify

1. **Rebranded to Yesify by yes.dev**:
   - Official brand identity: sleek white circle with a dark gray `+` in the middle.
   - Clean, telemetry-free, offline-first architecture (no external CDN dependencies or tracking).

2. **Unlocked Resizable Mini Player**:
   - Removes Spotify's locked dimensions and minimum size constraints.
   - **Interactive Document PiP**: Resize freely or switch instantly between presets:
     - **Micro (175x75)**: Ultra-compact floating pill with track info and play/skip.
     - **Compact (270x95)**: Sleek horizontal card with album art.
     - **Standard (350x175)**: Balanced card with progress bar and controls.
     - **Large (480x270)**: Spacious player with album art and seekbar.
   - Quick launcher button directly inside Spotify's bottom player bar.

3. **Aggressive Stay-On-Top (Minecraft Game Mode)**:
   - Games like Minecraft frequently hide standard browser popups due to fullscreen rendering layers.
   - Yesify provides **Hardware DirectComposition Video PiP** (`Game Topmost PiP`), creating an OS-level `WS_EX_TOPMOST` overlay that stays aggressively on top over Minecraft.
   - **Gamer Setup Tip**: In Minecraft (Java or Bedrock), set `Video Settings -> Fullscreen: OFF` (or press `F11` to run in Maximized Borderless Windowed). Yesify stays 100% on top while you mine, build, and fight!

4. **Ultra Lightweight Mode & Sound-Only Background Freeze**:
   - **Sound-Only When Unfocused**: Whenever you switch to another window, play a game, or background Spotify, all visual DOM updates, video loops, and canvas animations automatically freeze. Pure audio continues playing uninterrupted with **0% GPU** and **<0.3% CPU** usage.
   - **Ultra Lightweight Toggle**: Strips heavy Spotify feeds, album art carousels, and WebGL animations for maximum battery life and minimum RAM.

5. **Motion Logo Splash Screen**:
   - Animated loading experience on Spotify:
     - Pure white circle with a bold dark gray `+` in the middle scales in with smooth spring motion.
     - Clean bold math typography renders below: **YES** (white) **IFY** (dark gray) by **yes.dev**.
     - Seamlessly dissolves into the Spotify player once ready, or dismiss immediately with a click.

---

## 🚀 How to Install in Chrome / Edge / Brave

1. Download the latest `yesify.zip` from [yesd3v.github.io/yesify](https://yesd3v.github.io/yesify) or [Releases](https://github.com/YesD3v/yesify/releases).
2. Unzip the downloaded file to a folder on your computer.
3. Open your browser and navigate to the extensions manager:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
4. Toggle **Developer mode** on (top-right corner).
5. Click **Load unpacked** and select the extracted folder.
6. Pin **Yesify** to your toolbar!
7. Head over to [open.spotify.com](https://open.spotify.com/) (or press `Alt + S`).

---

## ⌨️ Shortcuts & Controls

- `Alt + S` or `Alt + Y`: Toggle the in-page frosted glass settings overlay directly on Spotify.
- **Extension Toolbar Icon**: Click while on Spotify to open the blurred in-page control center.
- **Player Bar PiP Icon**: Launch the Unlocked Mini Player directly from Spotify's bottom bar.
- **Controls & Modules**:
  - Ad Blocker: Silent blocking of audio & banner ads.
  - Unlocked Mini Player: Free resizing without the Premium paywall.
  - Aggressive Stay-On-Top: Hardware video overlay for gaming (Minecraft, etc.).
  - Sound-Only Unfocused: Halts background DOM rendering when blurred for 0% GPU.
  - Ultra Lightweight: Disables video feeds, canvas, and heavy carousels.
  - Motion Splash Logo: Elegant monochrome startup animation.

---

Crafted with precision by **yes.dev**.

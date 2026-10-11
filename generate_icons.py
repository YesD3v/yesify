import os
from PIL import Image, ImageDraw, ImageFilter

def create_icon(size):
    # Render at 4x supersampling for high fidelity and smooth antialiasing
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = s / 2.0
    radius = (s * 0.44)

    # Subtle dark outer glow/shadow for contrast against light browser toolbars
    shadow_img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.ellipse(
        [center - radius - 4 * scale, center - radius - 4 * scale, 
         center + radius + 4 * scale, center + radius + 4 * scale],
        fill=(10, 12, 16, 180)
    )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(3 * scale))
    img.alpha_composite(shadow_img)

    # Crisp white circle
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=(255, 255, 255, 255)
    )

    # Inner subtle rim / depth
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        outline=(230, 235, 240, 255),
        width=int(1.5 * scale)
    )

    # Vibrant rich gold + symbol in the middle
    # Proportions: clean mathematical plus
    bar_half_len = radius * 0.48
    bar_half_thick = radius * 0.14
    gold_color = (225, 175, 15, 255) # Rich deep gold
    gold_highlight = (255, 215, 0, 255) # Bright gold

    # Horizontal bar
    draw.rounded_rectangle(
        [center - bar_half_len, center - bar_half_thick,
         center + bar_half_len, center + bar_half_thick],
        radius=int(bar_half_thick * 0.35),
        fill=gold_color
    )

    # Vertical bar
    draw.rounded_rectangle(
        [center - bar_half_thick, center - bar_half_len,
         center + bar_half_thick, center + bar_half_len],
        radius=int(bar_half_thick * 0.35),
        fill=gold_color
    )

    # Subtle top highlight on the plus for depth
    y0 = center - bar_half_thick
    y1 = center - bar_half_thick + max(scale, bar_half_thick * 0.4)
    x0 = center - bar_half_len + scale
    x1 = center + bar_half_len - scale
    if y1 > y0 and x1 > x0:
        draw.rounded_rectangle(
            [x0, y0, x1, y1],
            radius=int(max(1, scale)),
            fill=(255, 235, 120, 220)
        )

    # Resize with high quality Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    os.makedirs("images", exist_ok=True)
    sizes = [16, 32, 48, 64, 128, 256, 512]
    for sz in sizes:
        icon = create_icon(sz)
        icon.save(f"images/icon{sz}.png", "PNG")
        print(f"Generated images/icon{sz}.png")

    # Also save standard names
    icon128 = create_icon(128)
    icon128.save("images/128.png", "PNG")
    icon48 = create_icon(48)
    icon48.save("images/48.png", "PNG")
    icon32 = create_icon(32)
    icon32.save("images/32.png", "PNG")

    # SVG version
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.35"/>
    </filter>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFDF00"/>
      <stop offset="50%" stop-color="#E5A800"/>
      <stop offset="100%" stop-color="#C68A00"/>
    </linearGradient>
  </defs>
  <!-- White Circle with Shadow -->
  <circle cx="50" cy="50" r="44" fill="#FFFFFF" filter="url(#shadow)" stroke="#F0F0F0" stroke-width="1"/>
  <!-- Gold Plus in Middle -->
  <rect x="29" y="44" width="42" height="12" rx="3.5" fill="url(#goldGrad)"/>
  <rect x="44" y="29" width="12" height="42" rx="3.5" fill="url(#goldGrad)"/>
</svg>'''
    with open("images/icon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Generated images/icon.svg")

if __name__ == "__main__":
    main()

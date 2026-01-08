#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1400})

    print("Loading Fire Orange shield variants...")
    page.goto('http://localhost:9000/shield-fire-variants.html', wait_until='networkidle')

    time.sleep(2)

    print("Taking screenshot...")
    page.screenshot(path='/tmp/shield_fire_variants.png', full_page=True)

    print("✅ Screenshot saved to /tmp/shield_fire_variants.png")
    print("\nFire Orange Shield - 10 Design Variants:")
    print("1. Classic - Original design with dual strokes")
    print("2. Solid - Increased fill opacity")
    print("3. Minimal - Thin stroke, minimal fill")
    print("4. Heavy - Thick stroke, bold presence")
    print("5. Gradient - Diagonal gradient fill for depth")
    print("6. Rounded - Softer, more rounded corners")
    print("7. Angular - Sharp, aggressive angles")
    print("8. Geometric - Center pattern with cross")
    print("9. Outline - Hollow outline only")
    print("10. Bold Inner - Strong inner shield border")

    browser.close()

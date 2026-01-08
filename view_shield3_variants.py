#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1400})

    print("Loading Shield 3 color variants on charcoal background...")
    page.goto('http://localhost:9000/shield3-charcoal-variants.html', wait_until='networkidle')

    time.sleep(2)

    print("Taking screenshot...")
    page.screenshot(path='/tmp/shield3_variants.png', full_page=True)

    print("✅ Screenshot saved to /tmp/shield3_variants.png")
    print("\nShield 3 - 10 Color Variants on Charcoal Background:")
    print("1. Blue Fire - #3b82f6")
    print("2. Fire Orange - #f97316")
    print("3. Electric Green - #22c55e (original)")
    print("4. Purple Mystic - #a855f7")
    print("5. Red Alert - #ef4444")
    print("6. Cyan Safe - #06b6d4")
    print("7. Pink Trust - #ec4899")
    print("8. Lime Verified - #84cc16")
    print("9. Gold Premium - #f59e0b")
    print("10. Violet Royal - #8b5cf6")
    print("\nAll variants feature:")
    print("- Shield pulse animation on hover (drop-shadow glow)")
    print("- Text glow animation on MEBRO text")
    print("- Energy ring expanding circles on hover (GSAP)")
    print("- Consistent charcoal background (linear-gradient)")

    browser.close()

#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1200})

    print("Loading trust badge mockups...")
    page.goto('http://localhost:9000/trust-badges.html', wait_until='networkidle')

    time.sleep(2)

    print("Taking screenshot...")
    page.screenshot(path='/tmp/trust_badges.png', full_page=True)

    print("✅ Screenshot saved to /tmp/trust_badges.png")
    print("\nBadge designs created:")
    print("1. Verified Seal - spinning blue circle with green checkmark")
    print("2. Scales of Justice - purple balance scales (animated)")
    print("3. Shield with Lock - red shield, security-focused")
    print("4. Medal Ribbon - gold medal with red ribbons")
    print("5. Crown - gold crown with cyan jewels")
    print("6. Wax Seal - red wax seal with dripping effect")
    print("7. Star Burst - 8-point green star burst (rotating)")
    print("8. Laurel Wreath - green wreath with crown center")
    print("9. Hex Lock - blue hexagon with lock emoji")
    print("10. Infinity Loop - purple infinity symbol")

    browser.close()

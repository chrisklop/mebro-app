#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1200})

    print("Loading logo mockups...")
    page.goto('http://localhost:9000/logo-mockups-v3.html', wait_until='networkidle')

    time.sleep(2)  # Wait for any animations to settle

    print("Taking screenshot of all logos...")
    page.screenshot(path='/tmp/all_logos.png', full_page=True)

    print("✅ Screenshot saved to /tmp/all_logos.png")
    print("\nYou can now view the logo options and tell me which one you prefer!")
    print("Format: 'Category Name' - 'Variant' (e.g., 'Shield 3 - Badge' or 'Circuit 2 - Blue Tech')")

    browser.close()

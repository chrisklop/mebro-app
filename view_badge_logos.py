#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1400})

    print("Loading badge logo mockups...")
    page.goto('http://localhost:9000/logo-with-badges.html', wait_until='networkidle')

    time.sleep(3)  # Wait for animations to settle

    print("Taking screenshot of all badge logos...")
    page.screenshot(path='/tmp/badge_logos.png', full_page=True)

    print("✅ Screenshot saved to /tmp/badge_logos.png")
    print("\nYou can now see all 20 logo variations with badges!")
    print("Let me know which ones you like best!")

    browser.close()

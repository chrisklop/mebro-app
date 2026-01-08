#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1400})

    print("Loading expanded badge + energy mockups...")
    page.goto('http://localhost:9000/badge-energy-expanded.html', wait_until='networkidle')

    time.sleep(2)

    print("Taking screenshot...")
    page.screenshot(path='/tmp/expanded.png', full_page=True)

    print("✅ Screenshot saved to /tmp/expanded.png")

    browser.close()

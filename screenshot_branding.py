#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1400})

    page.goto('http://localhost:9000/mebro-branding-kit.html', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/tmp/branding_kit.png', full_page=True)
    print("✅ Screenshot saved to /tmp/branding_kit.png")

    browser.close()

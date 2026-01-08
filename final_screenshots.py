#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Screenshot 1: Home page
    page = browser.new_page()
    page.set_viewport_size({"width": 1920, "height": 1400})
    page.goto('http://localhost:9000/index.html', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/tmp/homepage.png', full_page=True)
    print("✅ Homepage saved")
    
    # Screenshot 2: Redesign with sources
    page.goto('http://localhost:9000/mebro-redesign.html', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/tmp/redesign_full.png', full_page=True)
    print("✅ Redesign saved")
    
    browser.close()

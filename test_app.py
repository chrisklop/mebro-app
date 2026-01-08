#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1024, "height": 1280})

    try:
        print("Navigating to http://localhost:8081...")
        page.goto('http://localhost:8081', wait_until='networkidle', timeout=30000)

        print("Taking screenshot...")
        page.screenshot(path='/tmp/mebro_app.png', full_page=True)
        print("Screenshot saved to /tmp/mebro_app.png")

        # Wait a moment for any animations to settle
        time.sleep(1)

        # Check for key elements
        print("\nChecking for UI elements...")

        # Check header
        header = page.locator('text=Mebro')
        if header.count() > 0:
            print("✓ Header 'Mebro' found")
        else:
            print("✗ Header 'Mebro' not found")

        # Check input field
        input_field = page.locator('text=Claim to verify')
        if input_field.count() > 0:
            print("✓ 'Claim to verify' label found")
        else:
            print("✗ 'Claim to verify' label not found")

        # Check textarea
        textarea = page.locator('textarea')
        if textarea.count() > 0:
            print(f"✓ Textarea found")
            print(f"  - Visible: {textarea.first.is_visible()}")
            # Get bounding box
            bbox = textarea.first.bounding_box()
            if bbox:
                print(f"  - Position: ({bbox['x']:.0f}, {bbox['y']:.0f})")
                print(f"  - Size: {bbox['width']:.0f}x{bbox['height']:.0f}")
        else:
            print("✗ Textarea not found")

        # Check tone selector buttons
        buttons = page.locator('button')
        print(f"✓ Found {buttons.count()} buttons")

        # Check for tone labels
        for tone in ['academic', 'snarky', 'brutal']:
            tone_button = page.locator(f'text={tone}')
            if tone_button.count() > 0:
                print(f"✓ Tone button '{tone}' found")
            else:
                print(f"✗ Tone button '{tone}' not found")

        # Get page HTML to check for style attributes
        content = page.content()
        if 'style=' in content:
            style_count = content.count('style=')
            print(f"\n✓ Found {style_count} inline style attributes")

        # Try typing in the textarea
        print("\nTesting interaction...")
        if textarea.count() > 0:
            textarea.first.fill("This is a test claim for fact checking.")
            char_count = textarea.first.input_value()
            print(f"✓ Typed text in textarea: {len(char_count)} characters")

        print("\n✅ App is rendering! Check /tmp/mebro_app.png for the full page screenshot")

    except Exception as e:
        print(f"❌ Error: {e}")
        # Try to get any error messages from the page
        try:
            console_logs = page.evaluate("() => window.__logs || []")
            if console_logs:
                print("Console logs:", console_logs)
        except:
            pass
    finally:
        browser.close()

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
        time.sleep(1)

        print("\n✓ App loaded")
        print("\nTesting API integration...")

        # Find and fill textarea
        textarea = page.locator('textarea').first
        test_claim = "The moon landing in 1969 actually happened and is one of humanity's greatest achievements."

        print(f"Typing claim: '{test_claim}'")
        textarea.fill(test_claim)
        time.sleep(0.5)

        # Verify text was entered
        value = textarea.input_value()
        print(f"✓ Entered {len(value)} characters")

        # Check if submit button is now enabled
        submit_button = page.locator('text=Verify Claim')
        print(f"✓ Found 'Verify Claim' button")

        # Try to click submit button
        print("\nClicking 'Verify Claim' button...")
        submit_button.first.click()

        print("Waiting for API response...")
        time.sleep(3)

        # Check for loading state or result
        analyzing_text = page.locator('text=Analyzing')
        if analyzing_text.count() > 0:
            print("✓ Found 'Analyzing...' text - API call in progress")
            page.screenshot(path='/tmp/mebro_analyzing.png', full_page=True)

            # Wait for analysis to complete (up to 30 seconds)
            print("Waiting for analysis to complete (this may take a moment)...")
            max_wait = 30
            for i in range(max_wait):
                time.sleep(1)

                # Check for verdict display
                verdict = page.locator('text=TRUE, text=FALSE, text=MISLEADING, text=UNVERIFIED').first
                if page.locator('text=TRUE').count() > 0 or page.locator('text=FALSE').count() > 0 or page.locator('text=MISLEADING').count() > 0:
                    print("✓ Verdict received!")
                    page.screenshot(path='/tmp/mebro_result.png', full_page=True)
                    break

                # Check for error
                error_text = page.locator('text=/failed|error/i')
                if error_text.count() > 0:
                    print("✗ Error found:", error_text.first.text_content())
                    page.screenshot(path='/tmp/mebro_error.png', full_page=True)
                    break

                if i % 5 == 0:
                    print(f"  Still waiting... ({i}s)")
        else:
            # Check for errors
            error = page.locator('[class*="error"]')
            if error.count() > 0:
                print("✗ Error:", error.first.text_content())
            else:
                content = page.content()
                if "Failed to fetch" in content or "Network error" in content:
                    print("✗ Network error - backend may not be accessible")
                    print("Make sure the Vercel backend is running at: https://lmdyrfy.vercel.app/api")
                else:
                    print("Status: Waiting for response...")

        # Check console for any errors
        print("\nChecking for console errors...")
        page.evaluate("""
            window.consoleLogs = [];
            const oldLog = console.log;
            const oldError = console.error;
            const oldWarn = console.warn;

            console.log = function(...args) {
                window.consoleLogs.push({type: 'log', msg: args.join(' ')});
                oldLog.apply(console, args);
            };
            console.error = function(...args) {
                window.consoleLogs.push({type: 'error', msg: args.join(' ')});
                oldError.apply(console, args);
            };
            console.warn = function(...args) {
                window.consoleLogs.push({type: 'warn', msg: args.join(' ')});
                oldWarn.apply(console, args);
            };
        """)
        time.sleep(1)

        logs = page.evaluate("window.consoleLogs || []")
        if logs:
            print(f"Found {len(logs)} console messages:")
            for log in logs[-5:]:  # Show last 5
                print(f"  [{log['type']}] {log['msg']}")

        print("\n✅ API integration test complete!")
        print("Check /tmp/mebro_*.png for screenshots")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        browser.close()

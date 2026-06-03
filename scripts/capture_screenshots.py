import os
import shutil
from playwright.sync_api import sync_playwright

def capture_screenshots():
    output_dir = r"c:\Users\HP\OneDrive\Desktop\Project merging\agentguard-live\docs\assets"
    brain_dir = r"C:\Users\HP\.gemini\antigravity-ide\brain\e4ef2938-4784-4fc8-bae8-068ad8f01b8d\screenshots"
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(brain_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2
        )
        page = context.new_page()
        
        print("[*] Navigating to http://localhost:5173/ ...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.wait_for_timeout(2000)

        # 1. Full Dashboard
        full_path = os.path.join(output_dir, "agentguard_dashboard_full.png")
        page.screenshot(path=full_path, full_page=False)
        print(f"[+] Full dashboard captured: {full_path}")

        # 2. Left Timeline
        timeline_path = os.path.join(output_dir, "agentguard_timeline_panel.png")
        timeline_el = page.locator("section").nth(0)
        if timeline_el.count() > 0:
            timeline_el.screenshot(path=timeline_path)
            print(f"[+] Timeline panel captured: {timeline_path}")

        # 3. Monaco Diff Inspector
        diff_path = os.path.join(output_dir, "agentguard_diff_editor.png")
        diff_el = page.locator("section").nth(1)
        if diff_el.count() > 0:
            diff_el.screenshot(path=diff_path)
            print(f"[+] Diff editor captured: {diff_path}")

        # 4. Right Column (Analytics + Policy + Sandbox)
        analytics_path = os.path.join(output_dir, "agentguard_telemetry_policy.png")
        analytics_el = page.locator("section").nth(2)
        if analytics_el.count() > 0:
            analytics_el.screenshot(path=analytics_path)
            print(f"[+] Analytics/Policy captured: {analytics_path}")

        # 5. Bottom Control Deck
        controls_path = os.path.join(output_dir, "agentguard_control_deck.png")
        controls_el = page.locator("div.h-\\[82px\\]")
        if controls_el.count() > 0:
            controls_el.screenshot(path=controls_path)
            print(f"[+] Control deck captured: {controls_path}")

        browser.close()

    # Copy all to brain artifacts folder
    for fname in os.listdir(output_dir):
        if fname.endswith(".png"):
            src = os.path.join(output_dir, fname)
            dst = os.path.join(brain_dir, fname)
            shutil.copy2(src, dst)
            print(f"[+] Copied to brain: {dst}")

if __name__ == "__main__":
    capture_screenshots()

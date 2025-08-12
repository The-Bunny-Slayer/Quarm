import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the index.html file
    # The script is in jules-scratch/verification, so we need to go up two levels.
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, 'index.html')

    page.goto(f"file://{file_path}")

    # Search for the item
    page.get_by_placeholder("Enter item name...").fill("Akkirus's Mask of Warfare")
    page.get_by_role("button", name="Search").click()

    # Wait for the item to appear in the grid view
    item_locator = page.locator(".grid-item", has_text="Akkirus's Mask of Warfare")
    expect(item_locator).to_be_visible()

    # Hover to show tooltip
    item_locator.hover()

    # Wait for the tooltip to appear and for spell effects to be populated
    tooltip_locator = page.locator("#tooltip")
    expect(tooltip_locator).to_be_visible()

    # Wait for a specific effect to be rendered to ensure async operations are complete
    expect(tooltip_locator).to_contain_text("Click Effect: Aura of Battle")
    expect(tooltip_locator).to_contain_text("Increase Attack Speed by 25%")
    expect(tooltip_locator).to_contain_text("Increase AC by 7")


    # Take a screenshot of the tooltip area
    # I'll screenshot the whole page to be safe.
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

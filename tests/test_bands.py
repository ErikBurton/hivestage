import os

from dotenv import load_dotenv

from tests.pages.band_profile_page import BandProfilePage

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")

# Standard DeViation band ID
STANDARD_DEVIATION_ID = "46c54538-0bdc-4602-b572-95aa427ae0d5"


class TestBrowseBands:
    def test_bands_page_loads(self, page):
        page.goto(f"{BASE_URL}/bands")
        assert "Utah bands" in page.content()

    def test_bands_page_shows_search(self, page):
        page.goto(f"{BASE_URL}/bands")
        assert page.is_visible('input[placeholder="Search bands..."]')

    def test_bands_page_shows_filters(self, page):
        page.goto(f"{BASE_URL}/bands")
        assert page.is_visible("select")

    def test_bands_are_displayed(self, page):
        page.goto(f"{BASE_URL}/bands")
        page.wait_for_timeout(1000)
        assert page.is_visible("text=bands found")

    def test_search_filters_bands(self, page):
        page.goto(f"{BASE_URL}/bands")
        page.fill('input[placeholder="Search bands..."]', "Standard")
        page.wait_for_timeout(500)
        assert "Standard DeViation" in page.content()

    def test_clicking_band_goes_to_profile(self, page):
        page.goto(f"{BASE_URL}/bands")
        page.wait_for_timeout(1000)
        page.locator("a.bg-gray-900").first.click()
        assert "/bands/" in page.url


class TestBandProfile:
    def test_band_profile_loads(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        assert "Standard DeViation" in page.content()

    def test_band_profile_shows_upcoming_shows(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        assert page.is_visible('h2:has-text("Upcoming shows")')

    def test_follow_button_visible_when_logged_out(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        assert band.is_follow_button_visible()

    def test_follow_button_redirects_to_signup_when_logged_out(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        band.follow()
        page.wait_for_timeout(500)
        assert "/signup" in page.url

    def test_fan_can_follow_band(self, logged_in_fan):
        band = BandProfilePage(logged_in_fan)
        band.navigate(STANDARD_DEVIATION_ID)
        if band.is_follow_button_visible():
            band.follow()
            logged_in_fan.wait_for_timeout(1000)
            assert band.is_following()

    def test_fan_can_unfollow_band(self, logged_in_fan):
        band = BandProfilePage(logged_in_fan)
        band.navigate(STANDARD_DEVIATION_ID)
        if band.is_following():
            band.unfollow()
            logged_in_fan.wait_for_timeout(1000)
            assert band.is_follow_button_visible()

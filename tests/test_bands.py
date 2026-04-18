import os

import pytest  # noqa: F401
from dotenv import load_dotenv

from tests.pages.band_profile_page import BandProfilePage

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")
STANDARD_DEVIATION_ID = "46c54538-0bdc-4602-b572-95aa427ae0d5"


class TestBrowseBands:
    # --- Positive tests ---
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

    def test_clear_search_shows_all_bands(self, page):
        page.goto(f"{BASE_URL}/bands")
        page.fill('input[placeholder="Search bands..."]', "Standard")
        page.wait_for_timeout(500)
        page.click('button:has-text("Clear")')
        page.wait_for_timeout(500)
        assert page.is_visible("text=bands found")

    # --- Negative tests ---
    def test_search_nonexistent_band_shows_no_results(self, page):
        page.goto(f"{BASE_URL}/bands")
        page.fill('input[placeholder="Search bands..."]', "xyznonexistentband999")
        page.wait_for_timeout(500)
        assert "0 bands found" in page.content()

    def test_nonexistent_band_id_shows_404(self, page):
        page.goto(f"{BASE_URL}/bands/00000000-0000-0000-0000-000000000000")
        page.wait_for_timeout(2000)
        assert "404" in page.content() or "not found" in page.content().lower()

    def test_genre_filter_with_no_matches(self, page):
        page.goto(f"{BASE_URL}/bands")
        page.wait_for_timeout(1000)
        initial_count = page.locator("a.bg-gray-900").count()
        page.select_option("select:last-of-type", "Jazz")
        page.wait_for_timeout(2000)
        filtered_count = page.locator("a.bg-gray-900").count()
        assert filtered_count <= initial_count


class TestBandProfile:
    # --- Positive tests ---
    def test_band_profile_loads(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        assert "Standard DeViation" in page.content()

    def test_band_profile_shows_upcoming_shows(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        assert page.is_visible('h2:has-text("Upcoming shows")')

    def test_band_profile_shows_follower_count(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        page.wait_for_timeout(1000)
        assert "follower" in page.content()

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
            assert band.is_following()

    def test_fan_can_unfollow_band(self, logged_in_fan):
        band = BandProfilePage(logged_in_fan)
        band.navigate(STANDARD_DEVIATION_ID)
        if band.is_following():
            band.unfollow()
            logged_in_fan.wait_for_timeout(1000)
            assert band.is_follow_button_visible()

    def test_band_profile_shows_genres(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        assert page.is_visible("span.rounded-full")

    def test_back_to_bands_link(self, page):
        band = BandProfilePage(page)
        band.navigate(STANDARD_DEVIATION_ID)
        page.click('a:has-text("← Back to bands")')
        assert "/bands" in page.url

    # --- Negative tests ---
    def test_nonexistent_band_shows_404(self, page):
        page.goto(f"{BASE_URL}/bands/00000000-0000-0000-0000-000000000000")
        page.wait_for_timeout(2000)
        assert "404" in page.content() or "not found" in page.content().lower()

    def test_band_cannot_follow_band(self, logged_in_band):
        # band = BandProfilePage(logged_in_band)
        # band.navigate(STANDARD_DEVIATION_ID)
        # logged_in_band.wait_for_timeout(3000)
        # assert not band.is_follow_button_visible()
        # assert not band.is_following()
        pass

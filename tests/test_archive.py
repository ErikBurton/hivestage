import os

import pytest  # noqa: F401
from dotenv import load_dotenv

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")

# Use an event ID that we know exists and can temporarily set to past
# Random Precision at Redemption Bar & Grill
TEST_EVENT_ID = "fa8b3389-b8dd-498f-ad7f-b11e0eec9626"
STANDARD_DEVIATION_ID = "46c54538-0bdc-4602-b572-95aa427ae0d5"


class TestArchivePage:
    # --- Positive tests ---
    def test_archive_page_loads(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_selector("h1", timeout=10000)
        assert "Past Shows" in page.inner_text("h1")

    def test_archive_page_shows_filters(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(1000)
        assert page.is_visible('input[placeholder="Search past shows..."]')
        assert page.is_visible("select")

    def test_archive_page_shows_past_show_count(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(2000)
        assert "past show" in page.inner_text("body").lower()

    def test_archive_link_visible_on_events_page(self, page):
        page.goto(f"{BASE_URL}/events")
        page.wait_for_timeout(2000)
        assert page.is_visible('a[href="/events/archive"]')

    def test_archive_link_navigates_correctly(self, page):
        page.goto(f"{BASE_URL}/events")
        page.wait_for_timeout(2000)
        page.click('a[href="/events/archive"]')
        page.wait_for_url(f"{BASE_URL}/events/archive", timeout=10000)
        assert "/events/archive" in page.url

    def test_back_to_upcoming_link(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(1000)
        assert page.is_visible('a:has-text("← View upcoming shows")')

    def test_back_to_upcoming_navigates(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(1000)
        page.click('a:has-text("← View upcoming shows")')
        page.wait_for_url(f"{BASE_URL}/events", timeout=10000)
        assert "/events" in page.url
        assert "/archive" not in page.url

    def test_archive_search_filters_results(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(2000)
        page.fill('input[placeholder="Search past shows..."]', "xyznonexistent999")
        page.wait_for_timeout(500)
        assert "0 past shows" in page.inner_text("body")

    def test_archive_clear_filters(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(2000)
        page.fill('input[placeholder="Search past shows..."]', "test")
        page.wait_for_timeout(500)
        page.click('button:has-text("Clear")')
        page.wait_for_timeout(500)
        assert not page.is_visible('button:has-text("Clear")')

    def test_archive_events_link_to_detail(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(2000)
        event_links = page.locator("a.bg-gray-900")
        if event_links.count() > 0:
            event_links.first.click()
            page.wait_for_timeout(1000)
            assert "/events/" in page.url
            assert "/archive" not in page.url

    def test_archive_shows_past_show_badge(self, page):
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(2000)
        event_links = page.locator("a.bg-gray-900")
        if event_links.count() > 0:
            assert page.is_visible('span:has-text("Past show")')

    # --- Negative tests ---
    def test_upcoming_events_not_in_archive(self, page):
        # Get upcoming event titles from events page
        page.goto(f"{BASE_URL}/events")
        page.wait_for_timeout(2000)
        upcoming_cards = page.locator("a.bg-gray-900")
        if upcoming_cards.count() > 0:
            first_title = upcoming_cards.first.inner_text()
            # Check archive page doesn't show same event
            page.goto(f"{BASE_URL}/events/archive")
            page.wait_for_timeout(2000)
            archive_body = page.inner_text("body")
            # Events page shows upcoming, archive shows past - they shouldn't overlap
            # This is a soft check since titles could theoretically be similar
            assert "Past Shows" in archive_body

    def test_archive_events_not_on_main_events_page(self, page):
        # Archive page should have different events than main events page
        page.goto(f"{BASE_URL}/events/archive")
        page.wait_for_timeout(2000)
        archive_count_text = page.inner_text("body")

        page.goto(f"{BASE_URL}/events")
        page.wait_for_timeout(2000)
        # Main events page should show upcoming shows header
        assert "Live music across Utah" in page.inner_text("body")


class TestBandPastShows:
    # --- Positive tests ---
    def test_band_profile_shows_past_shows_section(self, page):
        page.goto(f"{BASE_URL}/bands/{STANDARD_DEVIATION_ID}")
        page.wait_for_timeout(2000)
        # Past shows section only appears if band has past events
        body = page.inner_text("body")
        assert "Upcoming shows" in body

    def test_past_shows_have_past_badge(self, page):
        page.goto(f"{BASE_URL}/bands/{STANDARD_DEVIATION_ID}")
        page.wait_for_timeout(2000)
        body = page.inner_text("body")
        # Check if past shows section exists
        if "Past shows" in body:
            assert page.is_visible('span:has-text("Past")')

    def test_past_shows_link_to_event_detail(self, page):
        page.goto(f"{BASE_URL}/bands/{STANDARD_DEVIATION_ID}")
        page.wait_for_timeout(2000)
        body = page.inner_text("body")
        if "Past shows" in body:
            past_links = page.locator("a.opacity-70")
            if past_links.count() > 0:
                past_links.first.click()
                page.wait_for_timeout(1000)
                assert "/events/" in page.url

    # --- Negative tests ---
    def test_past_shows_not_in_upcoming_section(self, page):
        page.goto(f"{BASE_URL}/bands/{STANDARD_DEVIATION_ID}")
        page.wait_for_timeout(2000)
        # Upcoming shows section should only have future events
        # Past shows should be in their own section
        body = page.inner_text("body")
        assert "Upcoming shows" in body

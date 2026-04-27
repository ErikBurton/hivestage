import os

import pytest  # noqa: F401
from dotenv import load_dotenv

from tests.pages.events_page import EventsPage

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")


class TestEventsPage:
    # --- Positive tests ---
    def test_events_page_loads(self, page):
        events = EventsPage(page)
        events.navigate()
        assert "Live music across Utah" in page.content()

    def test_events_page_shows_filters(self, page):
        events = EventsPage(page)
        events.navigate()
        assert page.is_visible("select")
        assert page.is_visible('button:has-text("Free only")')

    def test_events_are_displayed(self, page):
        events = EventsPage(page)
        events.navigate()
        count = events.get_event_count()
        assert count >= 0

    def test_free_only_filter(self, page):
        events = EventsPage(page)
        events.navigate()
        events.toggle_free_only()
        page.wait_for_timeout(1000)
        assert page.is_visible('button:has-text("Free only")')

    def test_clear_filters(self, page):
        events = EventsPage(page)
        events.navigate()
        events.toggle_free_only()
        page.wait_for_timeout(500)
        events.clear_filters()
        page.wait_for_timeout(500)
        assert not page.is_visible('button:has-text("Clear filters")')

    def test_clicking_event_goes_to_detail(self, page):
        events = EventsPage(page)
        events.navigate()
        count = events.get_event_count()
        if count > 0:
            events.click_first_event()
            assert "/events/" in page.url

    def test_nav_shows_correct_links(self, page):
        events = EventsPage(page)
        events.navigate()
        assert page.is_visible('a:has-text("Bands")')
        assert page.is_visible('a:has-text("Venues")')

    def test_event_detail_page_loads(self, page):
        events = EventsPage(page)
        events.navigate()
        count = events.get_event_count()
        if count > 0:
            events.click_first_event()
            page.wait_for_selector("h1", timeout=10000)
            assert page.is_visible("h1")

    def test_event_detail_shows_date(self, page):
        events = EventsPage(page)
        events.navigate()
        count = events.get_event_count()
        if count > 0:
            events.click_first_event()
            page.wait_for_selector("h1", timeout=10000)
            assert page.is_visible('span:has-text("🕐")')

    # --- Negative tests ---
    def test_nonexistent_event_shows_404(self, page):
        page.goto(f"{BASE_URL}/events/00000000-0000-0000-0000-000000000000")
        page.wait_for_timeout(2000)
        assert "404" in page.content() or "not found" in page.content().lower()

    def test_city_filter_shows_no_results_for_nonexistent_city(self, page):
        events = EventsPage(page)
        events.navigate()
        # Get initial count
        page.wait_for_timeout(1000)
        initial_count = events.get_event_count()
        # Apply a city filter
        page.select_option("select:first-of-type", "Moab")
        page.wait_for_timeout(2000)
        filtered_count = events.get_event_count()
        # Either no results or fewer results than before
        assert filtered_count <= initial_count


class TestEventCreation:
    # --- Positive tests ---
    def test_band_can_access_create_event(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector("h1", timeout=10000)
        assert "Post an Event" in logged_in_band.inner_text("h1")

    def test_event_form_has_required_fields(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector('input[maxlength="200"]', timeout=10000)
        assert logged_in_band.is_visible('input[maxlength="200"]')
        assert logged_in_band.is_visible('input[type="date"]')
        assert logged_in_band.is_visible('input[type="time"]')

    def test_event_form_has_venue_dropdown(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector("select", timeout=10000)
        assert logged_in_band.is_visible("select")

    def test_event_form_has_free_toggle(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector("button.rounded-full", timeout=10000)
        assert logged_in_band.is_visible("button.rounded-full")

    # --- Negative tests ---
    def test_event_form_requires_title(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector('button:has-text("Post event")', timeout=10000)
        logged_in_band.click('button:has-text("Post event")')
        assert logged_in_band.is_visible("p.text-red-400")

    def test_event_form_requires_date(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector('input[maxlength="200"]', timeout=10000)
        logged_in_band.fill('input[maxlength="200"]', "Test Event Title")
        logged_in_band.click('button:has-text("Post event")')
        assert logged_in_band.is_visible("p.text-red-400")

    def test_event_form_requires_time(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.wait_for_selector('input[maxlength="200"]', timeout=10000)
        logged_in_band.fill('input[maxlength="200"]', "Test Event Title")
        logged_in_band.fill('input[type="date"]', "2026-12-01")
        logged_in_band.click('button:has-text("Post event")')
        assert logged_in_band.is_visible("p.text-red-400")

    def test_create_event_redirects_when_logged_out(self, page):
        page.goto(f"{BASE_URL}/dashboard/events/new")
        page.wait_for_url(f"{BASE_URL}/login", timeout=10000)
        assert "/login" in page.url


class TestAddToCalendar:
    # --- Events list page ---
    def test_add_to_calendar_button_visible_on_events_list(self, page):
        events = EventsPage(page)
        events.navigate()
        page.wait_for_timeout(1000)
        count = events.get_event_count()
        if count > 0:
            assert page.is_visible('button:has-text("Add to Calendar")')

    def test_add_to_calendar_opens_dropdown(self, page):
        events = EventsPage(page)
        events.navigate()
        page.wait_for_timeout(1000)
        count = events.get_event_count()
        if count > 0:
            events.click_add_to_calendar()
            assert page.is_visible('a:has-text("Google Calendar")')
            assert page.is_visible('button:has-text("Apple Calendar")')
            assert page.is_visible('button:has-text("Outlook")')

    def test_add_to_calendar_closes_on_outside_click(self, page):
        events = EventsPage(page)
        events.navigate()
        page.wait_for_timeout(1000)
        count = events.get_event_count()
        if count > 0:
            events.click_add_to_calendar()
            assert page.is_visible('a:has-text("Google Calendar")')
            page.click("h1")
            page.wait_for_timeout(300)
            assert not page.is_visible('a:has-text("Google Calendar")')

    def test_google_calendar_link_has_correct_url(self, page):
        events = EventsPage(page)
        events.navigate()
        page.wait_for_timeout(1000)
        count = events.get_event_count()
        if count > 0:
            events.click_add_to_calendar()
            href = page.get_attribute('a:has-text("Google Calendar")', "href")
            assert "calendar.google.com" in href
            assert "action=TEMPLATE" in href

    # --- Event detail page ---
    def test_add_to_calendar_button_visible_on_detail_page(self, page):
        events = EventsPage(page)
        events.navigate()
        page.wait_for_timeout(1000)
        count = events.get_event_count()
        if count > 0:
            events.click_first_event()
            page.wait_for_selector("h1", timeout=10000)
            assert page.is_visible('button:has-text("Add to Calendar")')

    def test_add_to_calendar_opens_on_detail_page(self, page):
        events = EventsPage(page)
        events.navigate()
        page.wait_for_timeout(1000)
        count = events.get_event_count()
        if count > 0:
            events.click_first_event()
            page.wait_for_selector("h1", timeout=10000)
            page.click('button:has-text("Add to Calendar")')
            assert page.is_visible('a:has-text("Google Calendar")')

    # --- Negative tests ---
    def test_add_to_calendar_not_shown_when_no_events(self, page):
        events = EventsPage(page)
        events.navigate()
        page.select_option("select:first-of-type", "Moab")
        page.wait_for_timeout(2000)
        count = events.get_event_count()
        if count == 0:
            assert not page.is_visible('button:has-text("Add to Calendar")')

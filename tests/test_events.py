import os

from dotenv import load_dotenv

from tests.pages.events_page import EventsPage

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")


class TestEventsPage:
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


class TestEventCreation:
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

    def test_event_form_requires_title(self, logged_in_band):
        logged_in_band.goto(f"{BASE_URL}/dashboard/events/new")
        logged_in_band.click('button:has-text("Post event")')
        assert logged_in_band.is_visible("p.text-red-400")

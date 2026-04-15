import os

from dotenv import load_dotenv

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")


class TestAdminAccess:
    def test_admin_page_loads_for_admin(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin")
        assert "Admin" in logged_in_admin.content()
        assert "HiveStage control panel" in logged_in_admin.content()

    def test_admin_page_redirects_non_admin(self, logged_in_fan):
        logged_in_fan.goto(f"{BASE_URL}/admin")
        assert "/admin" not in logged_in_fan.url

    def test_admin_shows_stats(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin")
        assert logged_in_admin.is_visible("text=Total users")
        assert logged_in_admin.is_visible("text=Bands")
        assert logged_in_admin.is_visible("text=Venues")
        assert logged_in_admin.is_visible("text=Events")

    def test_admin_shows_bands_table(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin")
        assert logged_in_admin.is_visible("text=BANDS")

    def test_admin_shows_venues_table(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin")
        assert logged_in_admin.is_visible("text=VENUES")

    def test_admin_shows_events_table(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin")
        assert logged_in_admin.is_visible("text=ALL EVENTS")

    def test_admin_add_venue_button_visible(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin")
        assert logged_in_admin.is_visible('a:has-text("+ Add venue")')

    def test_admin_can_access_add_venue_page(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/admin/venues/new")
        assert "Add a Venue" in logged_in_admin.content()

    def test_admin_link_visible_on_dashboard(self, logged_in_admin):
        logged_in_admin.goto(f"{BASE_URL}/dashboard")
        assert logged_in_admin.is_visible('a:has-text("Admin Panel")')

    def test_admin_link_not_visible_for_fan(self, logged_in_fan):
        logged_in_fan.goto(f"{BASE_URL}/dashboard")
        assert not logged_in_fan.is_visible('a:has-text("Admin Panel")')

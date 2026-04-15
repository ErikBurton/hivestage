from .base_page import BasePage


class DashboardPage(BasePage):
    URL = "/dashboard"

    # Selectors
    WELCOME_MESSAGE = "p.text-gray-500"
    LOGOUT_BUTTON = 'button:has-text("Log out")'
    POST_EVENT_LINK = 'a:has-text("Post an Event")'
    BROWSE_EVENTS_LINK = 'a:has-text("Browse Events")'
    BROWSE_BANDS_LINK = 'a:has-text("Browse Bands")'
    BAND_PROFILE_LINK = 'a:has-text("Band Profile")'
    ADMIN_LINK = 'a:has-text("Admin Panel")'
    FOLLOWING_SECTION = 'p:has-text("Shows from bands you follow")'

    def navigate(self, path=""):
        super().navigate(self.URL)

    def logout(self):
        self.click(self.LOGOUT_BUTTON)

    def go_to_post_event(self):
        self.click(self.POST_EVENT_LINK)

    def go_to_band_profile(self):
        self.click(self.BAND_PROFILE_LINK)

    def go_to_admin(self):
        self.click(self.ADMIN_LINK)

    def get_welcome_message(self):
        return self.get_text(self.WELCOME_MESSAGE)

    def is_admin_link_visible(self):
        return self.is_visible(self.ADMIN_LINK)

    def is_following_section_visible(self):
        return self.is_visible(self.FOLLOWING_SECTION)

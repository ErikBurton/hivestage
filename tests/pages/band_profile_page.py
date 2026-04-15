from .base_page import BasePage


class BandProfilePage(BasePage):

    # Selectors
    FOLLOW_BUTTON = 'button:has-text("Follow")'
    FOLLOWING_BUTTON = 'button:has-text("Following")'
    FOLLOWER_COUNT = "p.text-gray-500"
    BAND_NAME = "h1"
    UPCOMING_SHOWS = 'h2:has-text("Upcoming shows")'
    NO_SHOWS = 'p:has-text("No upcoming shows scheduled")'

    def navigate(self, band_id=""):
        super().navigate(f"/bands/{band_id}")

    def follow(self):
        self.click(self.FOLLOW_BUTTON)

    def unfollow(self):
        self.click(self.FOLLOWING_BUTTON)

    def is_following(self):
        return self.is_visible(self.FOLLOWING_BUTTON)

    def is_follow_button_visible(self):
        self.page.wait_for_timeout(2000)
        return self.page.is_visible('button:has-text("Follow")')

    def get_band_name(self):
        return self.get_text(self.BAND_NAME)

    def get_follower_count(self):
        return self.get_text(self.FOLLOWER_COUNT)

from .base_page import BasePage


class EventsPage(BasePage):
    URL = "/events"

    # Selectors
    EVENT_CARDS = "a.bg-gray-900"
    CITY_FILTER = "select:first-of-type"
    GENRE_FILTER = "select:last-of-type"
    FREE_ONLY_BUTTON = 'button:has-text("Free only")'
    CLEAR_FILTERS_BUTTON = 'button:has-text("Clear filters")'
    NO_EVENTS_MESSAGE = 'p:has-text("No events found")'

    def navigate(self, path=""):
        super().navigate(self.URL)

    def filter_by_city(self, city):
        self.page.select_option(self.CITY_FILTER, city)

    def filter_by_genre(self, genre):
        self.page.select_option(self.GENRE_FILTER, genre)

    def toggle_free_only(self):
        self.click(self.FREE_ONLY_BUTTON)

    def clear_filters(self):
        self.click(self.CLEAR_FILTERS_BUTTON)

    def get_event_count(self):
        return self.page.locator(self.EVENT_CARDS).count()

    def click_first_event(self):
        self.page.locator(self.EVENT_CARDS).first.click()

    def is_no_events_visible(self):
        return self.is_visible(self.NO_EVENTS_MESSAGE)

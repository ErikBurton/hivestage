class BasePage:
    def __init__(self, page):
        self.page = page

    def navigate(self, path=""):
        import os

        from dotenv import load_dotenv

        load_dotenv(".env.test")
        base_url = os.getenv("TEST_BASE_URL", "http://localhost:3000")
        self.page.goto(f"{base_url}{path}")

    def get_title(self):
        return self.page.title()

    def wait_for_url(self, url):
        self.page.wait_for_url(url)

    def is_visible(self, selector):
        return self.page.is_visible(selector)

    def click(self, selector):
        self.page.click(selector)

    def fill(self, selector, value):
        self.page.fill(selector, value)

    def get_text(self, selector):
        return self.page.inner_text(selector)

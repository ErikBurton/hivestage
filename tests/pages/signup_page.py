from .base_page import BasePage


class SignupPage(BasePage):
    URL = "/signup"

    # Selectors
    DISPLAY_NAME_INPUT = 'input[placeholder="Display name"]'
    EMAIL_INPUT = 'input[type="email"]'
    PASSWORD_INPUT = 'input[placeholder="Password"]'
    SIGNUP_BUTTON = 'button:has-text("Create account")'
    ERROR_MESSAGE = "p.text-red-400"
    LOGIN_LINK = 'a:has-text("Log in")'
    TERMS_LINK = 'a:has-text("Terms")'
    PRIVACY_LINK = 'a:has-text("Privacy Policy")'

    def navigate(self, path=""):
        super().navigate(self.URL)

    def signup(self, display_name, email, password, account_type="fan"):
        self.fill(self.DISPLAY_NAME_INPUT, display_name)
        self.fill(self.EMAIL_INPUT, email)
        self.fill(self.PASSWORD_INPUT, password)
        self.page.click(f'button:has-text("{account_type.capitalize()}")')
        self.click(self.SIGNUP_BUTTON)

    def get_error(self):
        return self.get_text(self.ERROR_MESSAGE)

    def is_error_visible(self):
        return self.is_visible(self.ERROR_MESSAGE)

    def select_account_type(self, account_type):
        self.click(f'button:has-text("{account_type.capitalize()}")')

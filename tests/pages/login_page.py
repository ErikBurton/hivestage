from .base_page import BasePage


class LoginPage(BasePage):
    URL = "/login"

    # Selectors
    EMAIL_INPUT = 'input[type="email"]'
    PASSWORD_INPUT = 'input[type="password"]'
    LOGIN_BUTTON = 'button:has-text("Log in")'
    ERROR_MESSAGE = "p.text-red-400"
    FORGOT_PASSWORD_LINK = 'a:has-text("Forgot password?")'
    SIGNUP_LINK = 'a:has-text("Sign up free")'

    def navigate(self, path=""):
        super().navigate(self.URL)

    def login(self, email, password):
        self.fill(self.EMAIL_INPUT, email)
        self.fill(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

    def get_error(self):
        return self.get_text(self.ERROR_MESSAGE)

    def is_error_visible(self):
        self.page.wait_for_timeout(2000)
        return self.page.is_visible("p.text-red-400")

    def click_forgot_password(self):
        self.click(self.FORGOT_PASSWORD_LINK)

    def click_signup(self):
        self.click(self.SIGNUP_LINK)

    def toggle_password_visibility(self):
        self.click('button[type="button"]')

    def is_password_visible(self):
        input_type = self.page.get_attribute('input[placeholder="Password"]', "type")
        return input_type == "text"

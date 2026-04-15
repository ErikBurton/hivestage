import os

from dotenv import load_dotenv

from tests.pages.dashboard_page import DashboardPage
from tests.pages.login_page import LoginPage
from tests.pages.signup_page import SignupPage

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")
BAND_EMAIL = os.getenv("TEST_BAND_EMAIL")
BAND_PASSWORD = os.getenv("TEST_BAND_PASSWORD")
FAN_EMAIL = os.getenv("TEST_FAN_EMAIL")
FAN_PASSWORD = os.getenv("TEST_FAN_PASSWORD")


class TestLogin:
    def test_login_page_loads(self, page):
        login = LoginPage(page)
        login.navigate()
        assert "HiveStage" in page.content()

    def test_successful_band_login(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login(BAND_EMAIL, BAND_PASSWORD)
        page.wait_for_url(f"{BASE_URL}/dashboard")
        assert "/dashboard" in page.url

    def test_successful_fan_login(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login(FAN_EMAIL, FAN_PASSWORD)
        page.wait_for_url(f"{BASE_URL}/dashboard")
        assert "/dashboard" in page.url

    def test_invalid_credentials(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login("wrong@email.com", "wrongpassword")
        assert login.is_error_visible()

    def test_empty_credentials(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login("", "")
        assert "/dashboard" not in page.url

    def test_forgot_password_link(self, page):
        login = LoginPage(page)
        login.navigate()
        login.click_forgot_password()
        assert "/forgot-password" in page.url

    def test_signup_link(self, page):
        login = LoginPage(page)
        login.navigate()
        login.click_signup()
        assert "/signup" in page.url

    def test_password_visibility_toggle(self, page):
        login = LoginPage(page)
        login.navigate()
        page.fill('input[type="password"]', "testpassword")
        assert not login.is_password_visible()
        login.toggle_password_visibility()
        assert login.is_password_visible()
        login.toggle_password_visibility()
        assert not login.is_password_visible()


class TestLogout:
    def test_logout_redirects_to_home(self, logged_in_band):
        dashboard = DashboardPage(logged_in_band)
        dashboard.logout()
        logged_in_band.wait_for_url(f"{BASE_URL}/")
        assert logged_in_band.url == f"{BASE_URL}/"


class TestSignup:
    def test_signup_page_loads(self, page):
        signup = SignupPage(page)
        signup.navigate()
        assert "Create your account" in page.content()

    def test_signup_shows_account_type_buttons(self, page):
        signup = SignupPage(page)
        signup.navigate()
        assert page.is_visible('button:has-text("Fan")')
        assert page.is_visible('button:has-text("Band")')
        assert page.is_visible('button:has-text("Venue")')

    def test_terms_link_visible(self, page):
        signup = SignupPage(page)
        signup.navigate()
        assert page.is_visible('a:has-text("Terms")')

    def test_privacy_link_visible(self, page):
        signup = SignupPage(page)
        signup.navigate()
        assert page.is_visible('a:has-text("Privacy Policy")')

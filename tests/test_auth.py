import os

import pytest  # noqa: F401
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
    # --- Positive tests ---
    def test_login_page_loads(self, page):
        login = LoginPage(page)
        login.navigate()
        assert "HiveStage" in page.content()
        # assert "ThisTextDoesNotExist" in page.content()

    def test_successful_band_login(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login(BAND_EMAIL, BAND_PASSWORD)
        page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
        assert "/dashboard" in page.url

    def test_successful_fan_login(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login(FAN_EMAIL, FAN_PASSWORD)
        page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
        assert "/dashboard" in page.url

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
        page.fill('input[placeholder="Password"]', "testpassword")
        assert not login.is_password_visible()
        login.toggle_password_visibility()
        assert login.is_password_visible()
        login.toggle_password_visibility()
        assert not login.is_password_visible()

    # --- Negative tests ---
    def test_invalid_credentials(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login("wrong@email.com", "wrongpassword")
        assert login.is_error_visible()

    def test_wrong_password_shows_error(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login(BAND_EMAIL, "wrongpassword123")
        assert login.is_error_visible()
        assert "/dashboard" not in page.url

    def test_empty_credentials(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login("", "")
        assert "/dashboard" not in page.url

    def test_empty_password_does_not_login(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login(BAND_EMAIL, "")
        assert "/dashboard" not in page.url

    def test_empty_email_does_not_login(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login("", BAND_PASSWORD)
        assert "/dashboard" not in page.url

    def test_invalid_email_format(self, page):
        login = LoginPage(page)
        login.navigate()
        login.login("notanemail", "password123")
        assert "/dashboard" not in page.url

    def test_dashboard_redirects_to_login_when_logged_out(self, page):
        page.goto(f"{BASE_URL}/dashboard")
        page.wait_for_url(f"{BASE_URL}/login", timeout=10000)
        assert "/login" in page.url

    def test_dashboard_events_redirects_when_logged_out(self, page):
        page.goto(f"{BASE_URL}/dashboard/events/new")
        page.wait_for_url(f"{BASE_URL}/login", timeout=10000)
        assert "/login" in page.url


class TestLogout:
    # --- Positive tests ---
    def test_logout_redirects_to_home(self, logged_in_band):
        dashboard = DashboardPage(logged_in_band)
        dashboard.logout()
        logged_in_band.wait_for_url(f"{BASE_URL}/", timeout=10000)
        assert logged_in_band.url == f"{BASE_URL}/"

    def test_after_logout_dashboard_requires_login(self, logged_in_fan):
        dashboard = DashboardPage(logged_in_fan)
        dashboard.logout()
        logged_in_fan.wait_for_url(f"{BASE_URL}/", timeout=10000)
        logged_in_fan.goto(f"{BASE_URL}/dashboard")
        logged_in_fan.wait_for_url(f"{BASE_URL}/login", timeout=10000)
        assert "/login" in logged_in_fan.url


class TestSignup:
    # --- Positive tests ---
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

    def test_terms_link_navigates(self, page):
        signup = SignupPage(page)
        signup.navigate()
        page.click('a:has-text("Terms")')
        assert "/terms" in page.url

    def test_privacy_link_navigates(self, page):
        signup = SignupPage(page)
        signup.navigate()
        page.click('a:has-text("Privacy Policy")')
        assert "/privacy" in page.url

    # --- Negative tests ---
    def test_signup_with_empty_fields_fails(self, page):
        signup = SignupPage(page)
        signup.navigate()
        page.click('button:has-text("Create account")')
        assert "/dashboard" not in page.url

    def test_signup_with_invalid_email_fails(self, page):
        signup = SignupPage(page)
        signup.navigate()
        page.fill('input[placeholder="Display name"]', "Test User")
        page.fill('input[type="email"]', "notanemail")
        page.fill('input[placeholder="Password"]', "password123")
        page.click('button:has-text("Create account")')
        assert "/dashboard" not in page.url

    def test_signup_with_short_password_shows_error(self, page):
        signup = SignupPage(page)
        signup.navigate()
        page.fill('input[placeholder="Display name"]', "Test User")
        page.fill('input[type="email"]', "testuser999@example.com")
        page.fill('input[placeholder="Password"]', "123")
        page.click('button:has-text("Create account")')
        page.wait_for_timeout(2000)
        assert "/dashboard" not in page.url or page.is_visible("p.text-red-400")

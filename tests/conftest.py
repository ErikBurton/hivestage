import os

import pytest
from dotenv import load_dotenv

load_dotenv(".env.test")

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:3000")
BAND_EMAIL = os.getenv("TEST_BAND_EMAIL")
BAND_PASSWORD = os.getenv("TEST_BAND_PASSWORD")
FAN_EMAIL = os.getenv("TEST_FAN_EMAIL")
FAN_PASSWORD = os.getenv("TEST_FAN_PASSWORD")
ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def page(browser):
    page = browser.new_page()
    yield page
    page.close()


@pytest.fixture
def logged_in_band(page):
    page.goto(f"{BASE_URL}/login")
    page.fill('input[type="email"]', BAND_EMAIL)
    page.fill('input[type="password"]', BAND_PASSWORD)
    page.click('button:has-text("Log in")')
    page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
    yield page


@pytest.fixture
def logged_in_fan(page):
    page.goto(f"{BASE_URL}/login")
    page.fill('input[type="email"]', FAN_EMAIL)
    page.fill('input[type="password"]', FAN_PASSWORD)
    page.click('button:has-text("Log in")')
    page.wait_for_url(f"{BASE_URL}/dashboard")
    yield page


@pytest.fixture
def logged_in_admin(page):
    page.goto(f"{BASE_URL}/login")
    page.fill('input[type="email"]', ADMIN_EMAIL)
    page.fill('input[type="password"]', ADMIN_PASSWORD)
    page.click('button:has-text("Log in")')
    page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
    yield page

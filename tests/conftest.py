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
def browser_context_args(browser_context_args):
    return {**browser_context_args, "record_video_dir": None}


@pytest.fixture(autouse=True)
def trace_on_failure(context, request):
    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    yield
    if request.node.rep_call.failed if hasattr(request.node, "rep_call") else False:
        os.makedirs("test-results", exist_ok=True)
        trace_path = f"test-results/{request.node.name}.zip"
        context.tracing.stop(path=trace_path)
        print(f"\nTrace saved to: {trace_path}")
    else:
        context.tracing.stop()


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)


@pytest.fixture
def page(context):
    page = context.new_page()
    yield page
    page.close()


@pytest.fixture
def logged_in_band(context):
    page = context.new_page()
    page.goto(f"{BASE_URL}/login")
    page.fill('input[type="email"]', BAND_EMAIL)
    page.fill('input[type="password"]', BAND_PASSWORD)
    page.click('button:has-text("Log in")')
    page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
    yield page
    page.close()


@pytest.fixture
def logged_in_fan(context):
    page = context.new_page()
    page.goto(f"{BASE_URL}/login")
    page.fill('input[type="email"]', FAN_EMAIL)
    page.fill('input[type="password"]', FAN_PASSWORD)
    page.click('button:has-text("Log in")')
    page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
    yield page
    page.close()


@pytest.fixture
def logged_in_admin(context):
    page = context.new_page()
    page.goto(f"{BASE_URL}/login")
    page.fill('input[type="email"]', ADMIN_EMAIL)
    page.fill('input[type="password"]', ADMIN_PASSWORD)
    page.click('button:has-text("Log in")')
    page.wait_for_url(f"{BASE_URL}/dashboard", timeout=60000)
    yield page
    page.close()

@pytest.fixture(autouse=True)
def trace_on_failure(browser, request):
    context = browser.new_context()
    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    page = context.new_page()
    yield page
    if request.node.rep_call.failed:
        context.tracing.stop(path=f"traces/{request.node.name}.zip")
    else:
        context.tracing.stop()
    context.close()

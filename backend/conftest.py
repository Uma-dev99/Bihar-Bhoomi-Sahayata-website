import pytest


@pytest.fixture(autouse=True)
def _isolate_tests(request, settings):
    # Admin pages need static file URLs; the production storage expects
    # "collectstatic" to have run, so tests use the plain storage instead.
    settings.STORAGES = {
        **settings.STORAGES,
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }
    # Rate-limit counters live in the cache; start every test with a clean slate.
    if request.node.get_closest_marker("django_db"):
        request.getfixturevalue("db")
        from django.core.cache import cache

        cache.clear()

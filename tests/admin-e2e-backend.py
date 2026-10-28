"""Disposable real Django server for admin browser tests; never uses .env database."""
import os
from pathlib import Path
import sys
import tempfile

backend = Path(__file__).resolve().parents[2] / 'newsapp-server'
sys.path.insert(0, str(backend))
os.environ.update(DJANGO_SETTINGS_MODULE='newsapp.settings', DATABASE_URL='', DEBUG='True',
                  SECRET_KEY='disposable-test-secret-only-32-bytes-minimum', SECURE_SSL_REDIRECT='False', OPENAI_API_KEY='')
from django.conf import settings
with tempfile.TemporaryDirectory(prefix='news-admin-e2e-') as directory:
    settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': str(Path(directory) / 'test.sqlite3')}}
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    settings.PASSWORD_RESET_FRONTEND_URL = 'http://127.0.0.1:3216'
    settings.ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']
    import django
    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model
    call_command('migrate', verbosity=0)
    get_user_model().objects.create_superuser('admin-e2e', 'admin@example.test', 'test-admin-e2e-only')
    get_user_model().objects.create_user('reader-e2e', password='test-reader-e2e-only')
    get_user_model().objects.create_user('recovery-e2e', email='recovery@example.test', password='old-test-recovery-only')
    # These mailbox routes exist only in this disposable test process.
    import types
    from django.core import mail
    from django.http import JsonResponse
    from django.urls import path
    from newsapp.urls import urlpatterns
    test_urls = types.ModuleType('disposable_reader_test_urls')
    test_urls.urlpatterns = [path('__test__/mailbox/', lambda request: JsonResponse({'messages': [message.body for message in getattr(mail, 'outbox', [])]}))] + urlpatterns
    sys.modules[test_urls.__name__] = test_urls
    settings.ROOT_URLCONF = test_urls.__name__
    call_command('runserver', '127.0.0.1:3215', use_reloader=False)

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
    settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': str(Path(directory) / 'test.sqlite3'), 'OPTIONS': {'timeout': 30}}}
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    settings.PASSWORD_RESET_FRONTEND_URL = 'http://127.0.0.1:3216'
    settings.ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']
    settings.CORS_ALLOWED_ORIGINS = ['http://127.0.0.1:3216']
    # Browser test users share loopback and one process. The production 5/min
    # cross-endpoint login budget is verified separately by backend security tests.
    settings.REST_FRAMEWORK = {**settings.REST_FRAMEWORK, 'DEFAULT_THROTTLE_RATES': {**settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'], 'login': '100/min', 'user': '10000/min', 'anon': '10000/min'}}
    import django
    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model
    call_command('migrate', verbosity=0)
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute('PRAGMA journal_mode=WAL')
    from news.automation import config
    config()
    get_user_model().objects.create_superuser('admin-e2e', 'admin@example.test', 'test-admin-e2e-only')
    get_user_model().objects.create_user('reader-e2e', password='test-reader-e2e-only')
    get_user_model().objects.create_user('recovery-e2e', email='recovery@example.test', password='old-test-recovery-only')
    # These mailbox routes exist only in this disposable test process.
    import types
    from unittest.mock import patch
    from django.utils import timezone
    from news.article_test_data import FULL_ARTICLE, PREPARED
    from news.utils import ai_summarizer
    ai_summarizer.client = object()  # Mark configured only in this disposable process.
    def process_test_batch(request):
        from news.automation import tick
        from news.publishing_retries import tick_retries
        def feed(source, timeout):
            return [{'title': f'{source.pk} on-demand report {i}', 'description': 'Disposable feed evidence for the publishing workflow.', 'article_url': f'{source.url}/on-demand/{i}', 'published_at': timezone.now(), 'categories': [source.default_category.name] if source.default_category else []} for i in range(12)]
        with patch('news.automation.source_items', side_effect=feed), patch('news.article_writing.source_evidence', return_value=FULL_ARTICLE), patch('news.article_writing.prepare_article', return_value=PREPARED):
            run = None if request.GET.get('retry_only') else tick()
            retried = tick_retries()
        return JsonResponse({'id': run.pk if run else None, 'status': run.status if run else None, 'retried': retried.pk if retried else None})
    def failed_article_fixture(request):
        import json
        from news.models import NewsSource, CrawlRun
        from news.publishing_retries import record_failure
        from news.article_writing import ArticlePreparationError
        source = NewsSource.objects.get(pk=json.loads(request.body)['source'])
        run = CrawlRun.objects.create(trigger='scheduled', status='failed')
        item = {'title': 'Recovered browser retry article', 'description': 'A disposable retry fixture.', 'article_url': source.url + '/recovered-retry', 'published_at': timezone.now(), 'categories': []}
        job = record_failure(source, item, run, ArticlePreparationError('Do not expose a provider response', details={'code':'writing_balance'}))
        return JsonResponse({'id':job.pk})
    from django.core import mail
    from django.http import JsonResponse
    from django.views.decorators.csrf import csrf_exempt
    from django.urls import path
    from newsapp.urls import urlpatterns
    test_urls = types.ModuleType('disposable_reader_test_urls')
    test_urls.urlpatterns = [path('__test__/failed-article/', csrf_exempt(failed_article_fixture)), path('__test__/worker/', csrf_exempt(process_test_batch)), path('__test__/mailbox/', lambda request: JsonResponse({'messages': [message.body for message in getattr(mail, 'outbox', [])]}))] + urlpatterns
    sys.modules[test_urls.__name__] = test_urls
    settings.ROOT_URLCONF = test_urls.__name__
    call_command('runserver', '127.0.0.1:3215', use_reloader=False)

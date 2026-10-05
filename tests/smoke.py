import requests
import uuid

BACKEND = "http://127.0.0.1:8101"
FRONTEND = "http://localhost:3100"
username = "smoke_" + uuid.uuid4().hex[:12]
password = "Test-secret-not-production-38427!"
client = requests.Session()
client.trust_env = False
r = client.post(
    BACKEND + "/api/auth/registration/",
    json={"username": username, "password1": password, "password2": password},
)
assert r.status_code == 201, (r.status_code, r.text)
session = requests.Session()
session.trust_env = False
headers = {"Origin": FRONTEND}
r = session.post(
    FRONTEND + "/api/session",
    headers=headers,
    json={"username": username, "password": password},
)
assert r.status_code == 200, (r.status_code, r.text)
assert "access" not in r.json() and "refresh" not in r.json()
assert "HttpOnly" in r.headers["Set-Cookie"] and "Secure" in r.headers["Set-Cookie"]
# Supply secure cookies explicitly for this localhost HTTP test only.
cookies = "; ".join(f"{c.name}={c.value}" for c in session.cookies)
headers["Cookie"] = cookies
r = session.get(FRONTEND + "/api/session", headers=headers)
assert r.status_code == 200 and r.json()["username"] == username, (
    r.status_code,
    r.text,
)
r = session.get(FRONTEND + "/api/reader/feed", headers=headers)
assert r.status_code == 200, (r.status_code, r.text)
article = r.json()["results"][0]
article_id = article["id"]
assert "no-store" in r.headers.get("Cache-Control", "")
r = session.put(FRONTEND + f"/api/reader/saved/{article_id}", headers=headers, json={})
assert r.status_code == 200, (r.status_code, r.text)
r = session.get(FRONTEND + "/api/reader/saved", headers=headers)
assert article_id in [a["id"] for a in r.json()["results"]], r.text
r = session.get(
    FRONTEND + f"/api/reader/saved-status?ids={article_id}", headers=headers
)
assert r.json()["saved_ids"] == [article_id], r.text
r = session.put(
    FRONTEND + "/api/reader/preferences",
    headers=headers,
    json={"categories": [article["categories"][0]["id"]]},
)
assert r.status_code == 200, (r.status_code, r.text)
r = session.delete(FRONTEND + f"/api/reader/saved/{article_id}", headers=headers)
assert r.status_code == 204, (r.status_code, r.text)
r = session.get(FRONTEND + "/api/reader/saved", headers=headers)
assert r.json()["count"] == 0, r.text
r = session.put(
    FRONTEND + "/api/reader/preferences",
    headers={**headers, "Origin": "https://other.test"},
    json={"categories": []},
)
assert r.status_code == 403, r.text
r = session.get(FRONTEND + "/api/reader/admin", headers=headers)
assert r.status_code == 404, r.text
refresh = next(c.value for c in session.cookies if c.name == "news_refresh")
r = session.get(
    FRONTEND + "/api/reader/feed", headers={"Cookie": f"news_refresh={refresh}"}
)
assert r.status_code == 200 and "news_access=" in r.headers.get("Set-Cookie", ""), (
    r.status_code,
    r.text,
)
r = session.post(
    FRONTEND + "/api/reader/ask",
    headers=headers,
    json={"question": "What are the latest headlines?"},
)
assert r.status_code == 200 and r.json()["sources"], (r.status_code, r.text)
for path in (
    "/",
    "/login",
    "/signup",
    "/feed",
    "/news/custom",
    "/news/saved",
    "/local-news",
    "/timelines",
    "/lopsided",
    "/search?q=smoke",
    f'/categories/{article["categories"][0]["id"]}',
    f"/news/{article_id}",
):
    r = client.get(FRONTEND + path)
    assert r.status_code == 200, (path, r.status_code)
r = client.get(FRONTEND + "/news/999999")
assert r.status_code == 404, r.status_code
r = client.get(FRONTEND + "/api/exchange-rates")
assert r.status_code == 503 and "conversion_rates" not in r.json()
r = session.delete(FRONTEND + "/api/session", headers=headers)
assert (
    r.status_code == 200 and "Expires=Thu, 01 Jan 1970" in r.headers["Set-Cookie"]
), r.headers
print(
    "PASS: login, HttpOnly cookies, profile, feed, preferences, save/unsave, batch status, CSRF, proxy whitelist, refresh, AI fallback, 12 page routes, 404, exchange configuration, logout"
)

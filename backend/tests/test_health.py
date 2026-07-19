def test_health_check(client):
    response = client.get("/api/v1/health")
    # Due to fast api health endpoint prefix it might be at /api/v1/health or /health depending on main.py
    # Let's hit /health as it's defined on the root app in main.py
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "degraded"]

def test_ai_insights_endpoint_returns_actionable_summary(client):
    buyer_data = {
        "email": "ai-buyer@example.com",
        "first_name": "AI",
        "last_name": "Buyer",
        "phone": "+1234567890",
        "role": "buyer",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=buyer_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    response = client.get("/api/ai/insights", headers=headers)

    assert response.status_code == 200
    assert response.json()["summary"]
    assert "recommendations" in response.json()
    assert len(response.json()["recommendations"]) >= 1

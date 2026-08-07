def test_register_and_login_user(client):
    register_data = {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890",
        "role": "buyer",
        "password": "strongpassword",
    }

    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201
    assert response.json()["email"] == register_data["email"]
    assert response.json()["first_name"] == register_data["first_name"]

    login_data = {
        "email": "test@example.com",
        "password": "strongpassword",
    }

    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
    assert login_response.json()["token_type"] == "bearer"
    assert "refresh_token" in login_response.json()

    refresh_response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": login_response.json()["refresh_token"]},
    )
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.json()
    assert "refresh_token" in refresh_response.json()

    auth_headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}
    me_response = client.get("/api/auth/me", headers=auth_headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == register_data["email"]

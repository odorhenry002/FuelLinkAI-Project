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


def test_refresh_requires_refresh_token_type(client):
    register_data = {
        "email": "refresh-test@example.com",
        "first_name": "Refresh",
        "last_name": "User",
        "phone": "+1234567891",
        "role": "buyer",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=register_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": register_data["email"], "password": register_data["password"]},
    )

    access_token = login_response.json()["access_token"]
    refresh_response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": access_token},
    )

    assert refresh_response.status_code == 401
    assert "refresh token" in refresh_response.json()["detail"].lower()

def test_dashboard_overview_requires_auth(client):
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 401


def test_dashboard_overview_for_authenticated_user(client):
    register_data = {
        "email": "buyer@example.com",
        "first_name": "Buyer",
        "last_name": "User",
        "phone": "+1234567890",
        "role": "buyer",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=register_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": register_data["email"], "password": register_data["password"]},
    )
    access_token = login_response.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    overview_response = client.get("/api/dashboard/overview", headers=auth_headers)
    assert overview_response.status_code == 200
    assert overview_response.json()["role"] == "buyer"


def test_admin_dashboard_restricted_to_admin_users(client):
    buyer_data = {
        "email": "buyer2@example.com",
        "first_name": "Buyer2",
        "last_name": "User",
        "phone": "+1234567891",
        "role": "buyer",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=buyer_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    access_token = login_response.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    admin_response = client.get("/api/dashboard/admin", headers=auth_headers)
    assert admin_response.status_code == 403


def test_admin_dashboard_accessible_for_admin_users(client):
    admin_data = {
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "phone": "+1234567892",
        "role": "admin",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=admin_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": admin_data["email"], "password": admin_data["password"]},
    )
    access_token = login_response.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    admin_response = client.get("/api/dashboard/admin", headers=auth_headers)
    assert admin_response.status_code == 200
    assert "admin_actions" in admin_response.json()


def test_supplier_dashboard_accessible_for_supplier_users(client):
    supplier_data = {
        "email": "supplier@example.com",
        "first_name": "Supplier",
        "last_name": "User",
        "phone": "+1234567893",
        "role": "supplier",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=supplier_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": supplier_data["email"], "password": supplier_data["password"]},
    )
    access_token = login_response.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    supplier_response = client.get("/api/dashboard/supplier", headers=auth_headers)
    assert supplier_response.status_code == 200
    assert "supplier_actions" in supplier_response.json()


def test_transporter_dashboard_accessible_for_transporter_users(client):
    transporter_data = {
        "email": "transporter@example.com",
        "first_name": "Transporter",
        "last_name": "User",
        "phone": "+1234567894",
        "role": "transporter",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=transporter_data)
    login_response = client.post(
        "/api/auth/login",
        json={"email": transporter_data["email"], "password": transporter_data["password"]},
    )
    access_token = login_response.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    transporter_response = client.get("/api/dashboard/transporter", headers=auth_headers)
    assert transporter_response.status_code == 200
    assert "transporter_actions" in transporter_response.json()

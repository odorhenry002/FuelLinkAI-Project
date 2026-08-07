def test_company_list_requires_auth(client):
    response = client.get("/api/companies")
    assert response.status_code == 401


def test_company_creation_assigns_company_to_authenticated_user(client):
    register_data = {
        "email": "company-owner@example.com",
        "first_name": "Company",
        "last_name": "Owner",
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

    company_payload = {
        "name": "FuelFlow Logistics",
        "email": "hello@fuelflow.example",
        "phone": "+2348000000000",
        "address": "12 Lekki Phase 1",
        "city": "Lagos",
        "state": "Lagos",
        "country": "Nigeria",
        "industry": "Energy Logistics",
        "company_type": "supplier",
    }

    create_response = client.post('/api/companies', headers=auth_headers, json=company_payload)
    assert create_response.status_code == 201
    assert create_response.json()["name"] == company_payload["name"]

    me_response = client.get('/api/users/me', headers=auth_headers)
    assert me_response.status_code == 200
    assert me_response.json()["company_id"] == create_response.json()["id"]

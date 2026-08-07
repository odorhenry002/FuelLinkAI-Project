def test_buyer_can_create_rfq_and_view_it(client):
    buyer_data = {
        "email": "buyer-procurement@example.com",
        "first_name": "Buyer",
        "last_name": "Procurement",
        "phone": "+1234567890",
        "role": "buyer",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=buyer_data)
    buyer_login = client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    buyer_token = buyer_login.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    company_response = client.post(
        "/api/companies",
        headers=buyer_headers,
        json={
            "name": "Atlas Energy Buyers",
            "email": "ops@atlasenergy.example",
            "phone": "+2348000000001",
            "address": "8 Marina Rd",
            "city": "Lagos",
            "state": "Lagos",
            "country": "Nigeria",
            "industry": "Energy",
            "company_type": "buyer",
        },
    )
    assert company_response.status_code == 201

    rfq_payload = {
        "title": "Diesel supply for operations",
        "description": "Need 5000 litres of diesel for remote site operations before end of month.",
        "category": "fuel",
        "quantity": 5000,
        "unit": "litres",
        "delivery_location": "Lagos Port",
        "currency": "NGN",
    }

    create_rfq_response = client.post("/api/rfqs", headers=buyer_headers, json=rfq_payload)
    assert create_rfq_response.status_code == 201
    assert create_rfq_response.json()["title"] == rfq_payload["title"]

    list_rfq_response = client.get("/api/rfqs", headers=buyer_headers)
    assert list_rfq_response.status_code == 200
    assert len(list_rfq_response.json()) >= 1


def test_supplier_can_submit_quote_for_rfq(client):
    buyer_data = {
        "email": "supplier-rfq-buyer@example.com",
        "first_name": "Buyer",
        "last_name": "RFQ",
        "phone": "+1234567892",
        "role": "buyer",
        "password": "strongpassword",
    }
    supplier_data = {
        "email": "supplier-rfq@example.com",
        "first_name": "Supplier",
        "last_name": "RFQ",
        "phone": "+1234567893",
        "role": "supplier",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=buyer_data)
    client.post("/api/auth/register", json=supplier_data)

    buyer_login = client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    buyer_headers = {"Authorization": f"Bearer {buyer_login.json()['access_token']}"}
    supplier_login = client.post(
        "/api/auth/login",
        json={"email": supplier_data["email"], "password": supplier_data["password"]},
    )
    supplier_headers = {"Authorization": f"Bearer {supplier_login.json()['access_token']}"}

    client.post(
        "/api/companies",
        headers=buyer_headers,
        json={
            "name": "Delta Buyer Co",
            "email": "ops@deltabuyer.example",
            "phone": "+2348000000002",
            "address": "1 Victoria Island",
            "city": "Lagos",
            "state": "Lagos",
            "country": "Nigeria",
            "industry": "Energy",
            "company_type": "buyer",
        },
    )
    client.post(
        "/api/companies",
        headers=supplier_headers,
        json={
            "name": "Prime Fuel Supply",
            "email": "sales@primefuel.example",
            "phone": "+2348000000003",
            "address": "5 Ikeja",
            "city": "Lagos",
            "state": "Lagos",
            "country": "Nigeria",
            "industry": "Energy",
            "company_type": "supplier",
        },
    )

    rfq_response = client.post(
        "/api/rfqs",
        headers=buyer_headers,
        json={
            "title": "Jet A1 supply",
            "description": "Need jet fuel for operations.",
            "category": "fuel",
            "quantity": 1000,
            "unit": "litres",
            "delivery_location": "Abuja",
            "currency": "NGN",
        },
    )
    assert rfq_response.status_code == 201
    rfq_id = rfq_response.json()["id"]

    quote_response = client.post(
        "/api/rfqs/{rfq_id}/quotes".format(rfq_id=rfq_id),
        headers=supplier_headers,
        json={
            "price_per_unit": 950,
            "total_amount": 950000,
            "currency": "NGN",
            "notes": "Delivered by 5 days after confirmation.",
        },
    )
    assert quote_response.status_code == 201
    assert quote_response.json()["rfq_id"] == rfq_id

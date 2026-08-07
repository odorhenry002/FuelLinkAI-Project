def test_buyer_can_accept_quote_and_create_order(client):
    buyer_data = {
        "email": "order-buyer@example.com",
        "first_name": "Order",
        "last_name": "Buyer",
        "phone": "+1234567899",
        "role": "buyer",
        "password": "strongpassword",
    }
    supplier_data = {
        "email": "order-supplier@example.com",
        "first_name": "Order",
        "last_name": "Supplier",
        "phone": "+1234567898",
        "role": "supplier",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=buyer_data)
    client.post("/api/auth/register", json=supplier_data)

    buyer_login = client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    supplier_login = client.post(
        "/api/auth/login",
        json={"email": supplier_data["email"], "password": supplier_data["password"]},
    )

    buyer_headers = {"Authorization": f"Bearer {buyer_login.json()['access_token']}"}
    supplier_headers = {"Authorization": f"Bearer {supplier_login.json()['access_token']}"}

    client.post(
        "/api/companies",
        headers=buyer_headers,
        json={
            "name": "Order Buyer Holdings",
            "email": "ops@orderbuyer.example",
            "phone": "+2348000000009",
            "address": "44 Lekki Phase 1",
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
            "name": "Order Supplier Co",
            "email": "sales@ordersupplier.example",
            "phone": "+2348000000010",
            "address": "17 Victoria Island",
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
            "title": "Bulk LPG supply",
            "description": "Need 3000 kg LPG for industrial operations.",
            "category": "gas",
            "quantity": 3000,
            "unit": "kg",
            "delivery_location": "Port Harcourt",
            "currency": "NGN",
        },
    )
    assert rfq_response.status_code == 201
    rfq_id = rfq_response.json()["id"]

    quote_response = client.post(
        f"/api/rfqs/{rfq_id}/quotes",
        headers=supplier_headers,
        json={
            "price_per_unit": 1200,
            "total_amount": 3600000,
            "currency": "NGN",
            "notes": "Secure delivery within 7 days.",
        },
    )
    assert quote_response.status_code == 201
    quote_id = quote_response.json()["id"]

    order_response = client.post(
        "/api/orders",
        headers=buyer_headers,
        json={
            "rfq_id": rfq_id,
            "quote_id": quote_id,
            "delivery_location": "Port Harcourt Yard",
            "notes": "Proceed with supplier confirmation.",
        },
    )

    assert order_response.status_code == 201
    assert order_response.json()["rfq_id"] == rfq_id
    assert order_response.json()["quote_id"] == quote_id
    assert order_response.json()["status"] == "pending"

    list_orders = client.get("/api/orders", headers=buyer_headers)
    assert list_orders.status_code == 200
    assert len(list_orders.json()) >= 1

def test_transporter_can_create_delivery_for_order(client):
    buyer_data = {
        "email": "delivery-buyer@example.com",
        "first_name": "Delivery",
        "last_name": "Buyer",
        "phone": "+1234567890",
        "role": "buyer",
        "password": "strongpassword",
    }
    supplier_data = {
        "email": "delivery-supplier@example.com",
        "first_name": "Delivery",
        "last_name": "Supplier",
        "phone": "+1234567891",
        "role": "supplier",
        "password": "strongpassword",
    }
    transporter_data = {
        "email": "delivery-transporter@example.com",
        "first_name": "Delivery",
        "last_name": "Transporter",
        "phone": "+1234567892",
        "role": "transporter",
        "password": "strongpassword",
    }

    client.post("/api/auth/register", json=buyer_data)
    client.post("/api/auth/register", json=supplier_data)
    client.post("/api/auth/register", json=transporter_data)

    buyer_login = client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    supplier_login = client.post(
        "/api/auth/login",
        json={"email": supplier_data["email"], "password": supplier_data["password"]},
    )
    transporter_login = client.post(
        "/api/auth/login",
        json={"email": transporter_data["email"], "password": transporter_data["password"]},
    )

    buyer_headers = {"Authorization": f"Bearer {buyer_login.json()['access_token']}"}
    supplier_headers = {"Authorization": f"Bearer {supplier_login.json()['access_token']}"}
    transporter_headers = {"Authorization": f"Bearer {transporter_login.json()['access_token']}"}

    client.post(
        "/api/companies",
        headers=buyer_headers,
        json={
            "name": "Delivery Buyer Group",
            "email": "ops@deliverybuyer.example",
            "phone": "+2348000000001",
            "address": "12 Lekki Phase 1",
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
            "name": "Delivery Supplier Group",
            "email": "sales@deliverysupplier.example",
            "phone": "+2348000000002",
            "address": "27 Ikeja",
            "city": "Lagos",
            "state": "Lagos",
            "country": "Nigeria",
            "industry": "Energy",
            "company_type": "supplier",
        },
    )
    client.post(
        "/api/companies",
        headers=transporter_headers,
        json={
            "name": "Rapid Fuel Logistics",
            "email": "ops@rapidfuel.example",
            "phone": "+2348000000003",
            "address": "9 Apapa",
            "city": "Lagos",
            "state": "Lagos",
            "country": "Nigeria",
            "industry": "Logistics",
            "company_type": "transporter",
        },
    )

    rfq_response = client.post(
        "/api/rfqs",
        headers=buyer_headers,
        json={
            "title": "Jet fuel delivery",
            "description": "Need jet fuel for remote operations.",
            "category": "fuel",
            "quantity": 2000,
            "unit": "litres",
            "delivery_location": "Abuja",
            "currency": "NGN",
        },
    )
    assert rfq_response.status_code == 201
    rfq_id = rfq_response.json()["id"]

    quote_response = client.post(
        f"/api/rfqs/{rfq_id}/quotes",
        headers=supplier_headers,
        json={
            "price_per_unit": 1100,
            "total_amount": 2200000,
            "currency": "NGN",
            "notes": "Fleet delivery available.",
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
            "delivery_location": "Abuja Depot",
            "notes": "Urgent dispatch needed.",
        },
    )
    assert order_response.status_code == 201
    order_id = order_response.json()["id"]

    delivery_response = client.post(
        "/api/deliveries",
        headers=transporter_headers,
        json={
            "order_id": order_id,
            "vehicle_number": "LAG-104-TR",
            "route": "Lagos to Abuja",
            "eta": "2026-08-12T12:00:00",
            "notes": "Temperature-controlled tankers assigned.",
        },
    )

    assert delivery_response.status_code == 201
    assert delivery_response.json()["order_id"] == order_id
    assert delivery_response.json()["status"] == "assigned"

    list_response = client.get("/api/deliveries", headers=transporter_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1

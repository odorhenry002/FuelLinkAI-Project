def test_buyer_can_create_invoice_for_order(client):
    buyer_data = {
        "email": "invoice-buyer@example.com",
        "first_name": "Invoice",
        "last_name": "Buyer",
        "phone": "+1234567890",
        "role": "buyer",
        "password": "strongpassword",
    }
    supplier_data = {
        "email": "invoice-supplier@example.com",
        "first_name": "Invoice",
        "last_name": "Supplier",
        "phone": "+1234567891",
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
            "name": "Invoice Buyer Group",
            "email": "ops@invoicebuyer.example",
            "phone": "+2348000000001",
            "address": "1 Marina Rd",
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
            "name": "Invoice Supplier Group",
            "email": "sales@invoicesupplier.example",
            "phone": "+2348000000002",
            "address": "15 Ikeja",
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
            "title": "Petrol supply",
            "description": "Need petrol for operations.",
            "category": "fuel",
            "quantity": 1500,
            "unit": "litres",
            "delivery_location": "Kaduna",
            "currency": "NGN",
        },
    )
    assert rfq_response.status_code == 201
    rfq_id = rfq_response.json()["id"]

    quote_response = client.post(
        f"/api/rfqs/{rfq_id}/quotes",
        headers=supplier_headers,
        json={
            "price_per_unit": 1000,
            "total_amount": 1500000,
            "currency": "NGN",
            "notes": "Delivery in 5 days.",
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
            "delivery_location": "Kaduna Depot",
            "notes": "Proceed with dispatch.",
        },
    )
    assert order_response.status_code == 201
    order_id = order_response.json()["id"]

    invoice_response = client.post(
        "/api/invoices",
        headers=buyer_headers,
        json={
            "order_id": order_id,
            "due_date": "2026-08-20T00:00:00",
            "notes": "Settlement due in 14 days.",
        },
    )

    assert invoice_response.status_code == 201
    assert invoice_response.json()["order_id"] == order_id
    assert invoice_response.json()["status"] == "issued"
    assert invoice_response.json()["payment_status"] == "unpaid"

    list_response = client.get("/api/invoices", headers=buyer_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1

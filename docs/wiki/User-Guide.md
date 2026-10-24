# User Guide

## Catalog and Details

The application opens the farm catalog. The header links to products, the cart, and the account area. In the product catalog, search by name and select a category supplied by the API.

Map markers provide access to farm pages. Selecting a product card locates its producer; the product link opens the detail page.

Product details show available information, price, producer, size when present, and quantity controls. Farm details include a banner, history, location, and the producer's products. An empty state may be shown.

## Cart

1. Choose a quantity and add the product.
2. Open the cart.
3. Change quantities or remove lines.
4. Continue to the delivery form.

The cart persists in the current browser. Clearing site data or switching browsers does not restore the same cart.

## Registration and Sign-In

Registration requires first name, last name, email, password, password confirmation, and acceptance of the terms. The password must contain at least eight characters and match its confirmation.

The frontend validates the terms checkbox; the backend DTO does not store evidence of consent. This is not a complete legal consent-recording system.

An existing email produces an error. After registration, the application attempts to log in and open the profile. If this second step fails, it explains that the account exists and sign-in can be used.

Sign-in uses email and password. Invalid credentials do not publicly distinguish between an unknown email and an incorrect password.

`Recordarme` uses a persistent cookie with a configured validity of seven days, subject to token validity and the browser retaining cookies. The ordinary session has a thirty-minute inactivity timeout.

Use `Cerrar sesión` to log out. Private routes then require authentication again.

## Placing an Order

Both guests and authenticated customers can order. Delivery requires first name, last name, city, a five-digit postal code, street address, optional apartment, and telephone.

Confirmation shows the order number, date, and amount. Signed-in users can open their orders; guests can continue shopping. Opening confirmation clears the cart.

Although the interface mentions Stripe, no payment gateway or real charge is implemented. Do not enter card information or present confirmation as proof of payment.

## My Account

The profile displays basic account data and history, with three orders per page. Details include products, quantities, amounts, and delivery information.

Each user can only view orders linked to their account. Guest orders are not automatically attached to an account registered later.

New orders are created as `PENDING`. Status administration, date filtering, and invoice downloads are not implemented.

## Troubleshooting

| Symptom | Check |
|---|---|
| Catalog does not load | Backend availability and access to `/api` |
| Edited categories do not appear | Existing database records need updating separately from JSON |
| An old image appears | Hard refresh with `Ctrl + F5` |
| Profile requests sign-in | Expired session or missing cookies |
| Changing hostname loses the session | `localhost` and `127.0.0.1` are different origins |
| Map or external image does not load | Internet access and provider availability |

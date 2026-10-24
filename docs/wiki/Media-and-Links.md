# Screenshots and Project Links

## Repositories

- [Frontend repository](https://github.com/hannafr14/Tierras-de-Asturias-Frontend)
- [Backend repository](https://github.com/hannafr14/Tierras-de-Asturias-backend)

## Design and Jira

| Resource | Link |
|---|---|
| Desktop mockup | [Figma: desktop](https://www.figma.com/design/KIWo4qY828gz9moQC9s26L/Untitled?node-id=0-1) |
| Mobile design | [Figma: mobile](https://www.figma.com/design/KIWo4qY828gz9moQC9s26L/Untitled?node-id=38-1251) |
| Wireframe | [Figma: wireframe](https://www.figma.com/design/KIWo4qY828gz9moQC9s26L/Untitled?node-id=38-1252) |
| Jira backlog | [PPTDA board 67, with PPTDA-392 selected](https://hannafrolova14.atlassian.net/jira/software/projects/PPTDA/boards/67/backlog?selectedIssue=PPTDA-392) |

Links were supplied by the project author. Access permissions and Jira completion statuses have not been verified. Ensure that authorized evaluators can open the resources. Design screenshots must not be presented as evidence of implemented functionality.

## Pending Links

| Resource | Required information |
|---|---|
| Published Wiki | Chosen Confluence space or GitHub Wiki |
| Deployment | Public application URL and API URL, if applicable |

## Frontend Screenshots

Planned location: `docs/images/`. Image embeds will be added once the files exist, avoiding broken images in the README.

| File | Content | Priority |
|---|---|---|
| `catalog-products-desktop.png` | Products, categories, and map | Main |
| `farm-details-desktop.png` | Banner, history, and location | Main |
| `product-details-desktop.png` | Product, price, and quantities | Recommended |
| `cart-desktop.png` | Cart with two test products | Recommended |
| `checkout-desktop.png` | Delivery and summary using fictitious data | Recommended |
| `account-orders-desktop.png` | Demonstration profile and history | Main |
| `order-details-desktop.png` | Details of an own test order | Recommended |
| `catalog-products-mobile.png` | Mobile catalog | Main |
| `account-orders-mobile.png` | Mobile history | Recommended |
| `register-validation.png` | Validation messages | Optional |

Desktop and mobile catalog screenshots are enough to start the README. Other screenshots support the Wiki and presentation.

## Preparation

- Desktop: approximately 1440 x 900 or 1440 x 1000.
- Mobile: approximately 390 x 844.
- Sharp PNG or WebP files, with lowercase names and no spaces.
- Wait for the map and photographs to finish loading.
- Use demonstration data, not real addresses or telephone numbers.
- Exclude passwords, cookies, CSRF tokens, keys, and card information.
- Keep Figma designs distinct from screenshots of implemented features.

Once the real file has been added, the README can include:

```markdown
![Product catalog](docs/images/catalog-products-desktop.png)
```

## Backend Screenshots

These are optional: the backend Wiki already includes a Mermaid data diagram and API documentation.

- `api-products.png`: product GET request with a 200 response.
- `api-validation.png`: 400 response using fictitious data.
- `api-my-orders.png`: own orders without personal information.
- `backend-tests.png`: test summary with date and scope.

Planned location: the backend's `docs/images/`. In Postman, hide cookies and tokens, including in lower tabs. Never add a SQL dump or a screenshot containing secrets.

## Rights

Producer photographs retain their respective rights. `public/images/farms/sources.json` records sources but does not establish permission to republish. A screenshot of the site does not make third-party images freely reusable.

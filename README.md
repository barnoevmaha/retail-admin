# retail-admin

Admin panel for the Retail Management System. Built with React + Vite + Tailwind CSS.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 4
- React Router DOM 6
- Axios

## Pages

- Dashboard (revenue, profit, trends, KPIs)
- Products (CRUD)
- Categories, Brands
- Colors, Sizes
- Orders
- Customers
- Suppliers
- Warehouse
- Receiving, Returns, Write-Offs, Adjustments
- POS (cashier interface)
- Analytics
- Audit Log, Inventory History
- Notifications
- Receipts
- Settings & Company
- Product Images Gallery

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | /api | Backend API base URL (build-time, optional) |
| BACKEND_URL | — | Backend URL for nginx proxy (runtime, required) |

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

Starts on port 5174 with Vite proxy forwarding /api to localhost:8000.

## Production Build

```bash
VITE_API_URL=https://your-backend-url/api npm run build
```

Or via Docker:

```bash
docker build --build-arg VITE_API_URL=https://your-backend-url/api -t retail-admin .
```

## Railway Deployment

1. Push this repo to GitHub
2. In Railway, create a new project from the repo
3. Set environment variables: `BACKEND_URL` (required for nginx proxy) and optionally `VITE_API_URL` (for direct API calls)
4. Deploy

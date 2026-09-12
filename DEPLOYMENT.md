# Deployment

## Frontend — Vercel or Netlify

1. Deploy the project root.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable:
   - `VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN/api`

## Backend — Render/Railway or any Python host

Deploy the `backend` directory.

Build:

```bash
pip install -r requirements.txt
```

Start:

```bash
python app.py
```

The backend listens on the platform-provided `PORT`.

## Important

SQLite is included for easy demos and competitions. For a multi-instance production deployment, replace SQLite with PostgreSQL and keep the same REST API contract.

# SURAKSHA AI — HTML + CSS + JavaScript + React + Python

Competition-ready disaster intelligence web application.

## Stack
- HTML: `index.html`
- CSS: `src/index.css` + Tailwind utilities
- JavaScript: all application logic in `src/**/*.js`
- React: React 18 frontend
- Python: Flask backend in `backend/`
- Database: SQLite (local, automatically seeded)
- Maps/charts/icons: Leaflet, Recharts, Lucide

## 1. Start Python backend

Windows:

```bat
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

Keep this terminal running. Backend runs on `http://localhost:5000`.

## 2. Start React frontend

Open a second terminal:

```bat
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## 3. Production build

```bat
npm run build
```

The generated frontend is in `dist/`.

## No Supabase / paid API required

The app has been migrated from the exported Bolt/Supabase data layer to the included Flask + SQLite backend. The Copilot uses a local rule-based disaster intelligence engine, so no OpenAI/Gemini API key is required.

## Deployment

Deploy the frontend to Vercel/Netlify and the `backend/` folder to a Python host such as Render/Railway. Set `VITE_API_BASE_URL` on the frontend to the deployed backend URL ending in `/api`.

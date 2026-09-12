# SURAKSHA AI Authentication

## Local demo accounts
- Citizen: citizen@suraksha.ai / Suraksha@123
- Authority: authority@suraksha.ai / Suraksha@123
- Admin: admin@suraksha.ai / Suraksha@123

## Start
1. Frontend: `npm install` then `npm run dev`
2. Backend: `cd backend`, create/activate `.venv`, `pip install -r requirements.txt`, then `python app.py`

## Password reset
Use **Forgot password?** on the login page. In this offline/local build a 15-minute reset token is displayed on screen. In production, replace this with an email/SMS delivery provider.

## Security notes
Passwords are stored as Werkzeug password hashes, not plaintext. Sessions use random bearer tokens. Password reset tokens expire and are single-use; resetting a password invalidates existing sessions.

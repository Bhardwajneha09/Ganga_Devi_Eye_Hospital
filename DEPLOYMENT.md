# Deployment

## Render backend

Create a Render Web Service from the `backend` folder.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```text
ADMIN_TOKEN=gangadevirewari
FRONTEND_ORIGIN=*
DATABASE_PATH=/tmp/database.json
HOSPITAL_SMS_NUMBER=+919991712690
```

These values are for the free Render plan. Free Render does not keep `/tmp` data forever, so appointments can reset after a redeploy or restart. For permanent storage later, use a paid Render disk with `DATABASE_PATH=/var/data/database.json`, or move the backend to MongoDB.

Optional email notification variables:

```text
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
NOTIFICATION_EMAIL=gangadevieyehospital@gmail.com
```

SMS notification variables:

```text
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=your-twilio-phone-number
```

Automatic SMS requires an SMS provider. This backend is wired for Twilio; after those variables are added in Render, every successful appointment booking sends an SMS to `HOSPITAL_SMS_NUMBER`.

After Render deploys, copy the backend URL. It will look like:

```text
https://your-render-backend.onrender.com
```

## Vercel frontend

Create a Vercel project from the `frontend` folder.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Environment variable:

```text
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

The frontend build is intentionally static and does not depend on Vite's native dev server. During the build, `VITE_API_BASE_URL` is written into the generated page so the Vercel site can call the Render backend.

After Vercel deploys, open:

```text
https://your-vercel-site.vercel.app/admin
```

Use this admin token:

```text
gangadevirewari
```

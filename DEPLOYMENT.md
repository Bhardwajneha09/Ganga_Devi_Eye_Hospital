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
FRONTEND_ORIGIN=https://your-vercel-site.vercel.app
```

Optional email notification variables:

```text
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
NOTIFICATION_EMAIL=gangadevieyehospital@gmail.com
```

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

After Vercel deploys, open:

```text
https://your-vercel-site.vercel.app/admin
```

Use this admin token:

```text
gangadevirewari
```



# 📘 Workspace Booking System – Full Project README

A full-stack workspace / conference room booking application consisting of:

* **Frontend:** React (Create React App)
* **Backend:** Node.js (TypeScript) + Express + PostgreSQL (Neon)
* **Deployment:** Render / Railway / Vercel (frontend)

---

# 🚀 Project Structure

```
/workspace-booking
   ├── frontend   # React App (Create React App)
   └── backend    # Node + Express + PostgreSQL API
```

---

# 🖥️ Frontend (React)

This project was bootstrapped with **Create React App**.

## Available Scripts

### `npm start`

Runs the app in development mode.
Visit: [http://localhost:3000](http://localhost:3000)

### `npm test`

Runs tests in watch mode.

### `npm run build`

Creates a production build in the `build/` folder.

### `npm run eject`

(Not recommended) Allows full control over Webpack & Babel configs.

## Learn More

* CRA Docs: [https://facebook.github.io/create-react-app/docs/getting-started](https://facebook.github.io/create-react-app/docs/getting-started)
* React Docs: [https://reactjs.org/](https://reactjs.org/)
* Troubleshooting Build Issues:
  [https://facebook.github.io/create-react-app/docs/troubleshooting](https://facebook.github.io/create-react-app/docs/troubleshooting)

---

# 🛠️ Backend (Node.js + Express + PostgreSQL)

## Requirements

* **Node.js >= 18**
* **PostgreSQL** (Neon or local)
* `.env` file with `DATABASE_URL`

## 🔧 Setup Instructions

### 1. Install dependencies

```
npm install
```

### 2. Configure environment variables

```
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=<your Neon PostgreSQL connection string>
PORT=4000
```

### 3. Create database tables (migrations)

```
npm run migrate
```

### 4. Insert demo data

```
npm run seed
```

### 5. Run development server

```
npm run dev
```

### 6. Build + run production

```
npm run build
npm start
```

---

# 🔌 API Endpoints

## Rooms

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| GET    | `/api/rooms`      | List rooms      |
| POST   | `/api/rooms`      | Create room     |
| POST   | `/api/rooms/seed` | Seed demo rooms |

### Create Room (body)

```json
{
  "name": "Meeting Room A",
  "baseHourlyRate": 200,
  "capacity": 8,
  "description": "Conference room"
}
```

---

## Bookings

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| POST   | `/api/bookings`            | Create booking              |
| POST   | `/api/bookings/:id/cancel` | Cancel booking              |
| GET    | `/api/bookings?from&to`    | List bookings in date range |

### Create Booking (body)

```json
{
  "roomId": 1,
  "userName": "Mahesh",
  "startTime": "2025-01-01T10:00:00Z",
  "endTime": "2025-01-01T12:00:00Z"
}
```

---

## Analytics

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/analytics?from&to` | Revenue, stats, usage |

Date format:

```
YYYY-MM-DD
```

---

# 🧮 Pricing Model

* Billing is **per-minute proration**
* Base: `baseHourlyRate` (per room)
* **Peak hours multiplier = 1.5×**

  * Mon–Fri **10:00–13:00 IST**
  * Mon–Fri **16:00–19:00 IST**
* Pricing is computed **server-side** to avoid client tampering.

---

# 🔐 Concurrency & Conflict Handling

Booking creation uses a **SERIALIZABLE transaction**:

1. Start `TRANSACTION ISOLATION LEVEL SERIALIZABLE`
2. Check for conflicting bookings (time overlap)
3. Insert new booking
4. Commit
5. If conflict → retry (configurable via `BOOKING_TX_RETRIES`)

This prevents double-booking even under high concurrency.

---

# ❌ Cancellation Policy

* Cancellation allowed **only if current time is ≥ 2 hours before the booking start time**.
* Cancelled bookings excluded from analytics.

---

# 📊 Analytics Logic

* Processed from `bookings` table:

  * Total revenue
  * Total booking minutes
  * Peak vs non-peak usage
  * Cancelled bookings ignored

---

# 🧱 Database Schema

### `rooms`

```
id, name, base_hourly_rate, capacity, description
```

### `bookings`

```
id, room_id, user_name, start_time, end_time,
duration_minutes, total_price, status
```

---

# ⚙️ Deployment Notes

### Backend (Render / Railway)

* Build: `npm run build`
* Start: `npm start`
* Set environment variables:

  ```
  DATABASE_URL=<Neon URL>
  PORT=4000
  ```

### Frontend (Vercel / Netlify / Render)

* Set `REACT_APP_API_URL` in `.env`
* Build:

  ```
  npm run build
  ```

---

# 📌 Summary

This project provides:

✔ Full React frontend
✔ TypeScript backend with solid architecture
✔ PostgreSQL schema + migrations
✔ Dynamic pricing with peak hours
✔ Safe booking conflict handling
✔ Analytics endpoints
✔ Production-ready deployment setup



# FiveMarket - Fresh Setup Checklist

## ✅ Database Setup Verification

### Migration Files (in order)

1. **`00_schema.sql`** - Complete database schema
   - All tables (user, client, freelancer, administrator, service, order, etc.)
   - Service status columns (`is_active`, `paused_at`)
   - Withdrawal request table
   - All indexes and constraints
   - Triggers for updated_at timestamps
2. **`03_seed_data.sql`** - Sample data ✅ **FIXED**
   - 22 users (20 freelancers, 2 admins)
   - Admin users: userID 21 & 22
   - Services, orders, reviews, etc.

### Auto-Migration

The API container automatically runs all migrations on startup via `db/scripts/migrate.js`.

## 🚀 Setup Steps for Teammates

### 1. Clone & Install

```bash
git clone <repo-url>
cd FiveMarket
npm install
```

### 2. Environment Files

**`apps/web/.env`**

```env
VITE_API_URL=http://localhost:3000
```

**`apps/api/.env`**

```env
PORT=3000
DATABASE_URL=postgres://fivemarket:fivemarket@localhost:5432/fivemarket
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=devsecret
HASHID_SALT=FiveMarket-Dev-Salt-2024
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<redacted for privacy>
EMAIL_PASSWORD=<redacted for privacy>
EMAIL_FROM=<redacted for privacy>

FRONTEND_URL=http://localhost:5173
```

### 3. Start Services

```bash
# Start DB + API (auto-migrates)
docker compose up --build -d

# Start frontend
npm run dev:web
```

### 4. Access the App

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Database**: localhost:5432

## 🔑 Test Credentials

After seeding, you can log in with:

**Admin Users** (userID 21, 22):

- Check seed data for emails
- Password: password123 (for all seeded users)

**Freelancers** (userID 1-20):

- Check seed data for emails
- Password: password123 (for all seeded users)

## ✅ What Works Out of the Box

### For All Users

- ✅ Registration & Login
- ✅ Browse services
- ✅ View service details
- ✅ Profile management
- ✅ Password reset

### For Clients

- ✅ Order services
- ✅ View my orders
- ✅ Message freelancers
- ✅ Leave reviews
- ✅ Create disputes

### For Freelancers

- ✅ **Freelancer Dashboard** (Overview, Services, Sales, Withdrawals tabs)
  - View stats (earnings, orders, reviews)
  - Manage services (pause/activate, edit, delete)
  - View and manage orders
  - Request withdrawals
- ✅ Create/edit services
- ✅ Manage packages and add-ons
- ✅ Upload portfolio images
- ✅ Skill tests

### For Admins

- ✅ **Admin Dashboard** (Overview, Analytics tabs)
  - Platform stats (users, orders, disputes, revenue)
  - Top earners table
  - Popular categories
  - Top rated services
  - Recent activity
- ✅ User management (`/admin/users`)
- ✅ Order management (`/admin/orders`)
- ✅ Dispute resolution (`/admin/disputes`)

## 🎨 UI Features

### Navigation

- **Admins**: Navbar shows "Browse" + "Dashboard" → All management via dashboard
- **Freelancers**: Navbar shows "Browse" + "Messages" → Dashboard in dropdown
- **Clients**: Navbar shows "Browse" + "Messages"

### Dashboard-Centric Design

- **Freelancer Dashboard**: Central hub for all freelancer activities
- **Admin Dashboard**: Central hub for platform analytics and management

## 🐛 Known Issues / Notes

1. **Passwords in seed data**: Make sure seed data has properly hashed passwords (bcrypt)
2. **Image uploads**: Ensure `apps/api/uploads/` directory exists and is writable
3. **JWT Secret**: Change `JWT_SECRET` in production!

## 📝 Database Schema Highlights

### Key Tables

- `user` - Base user table (userID is BIGINT, camelCase quoted)
- `client`, `freelancer`, `administrator` - Role tables
- `service` - Services with `is_active` status
- `package` - Service packages (Basic, Standard, Premium)
- `order` - Orders with status tracking
- `withdrawal_request` - Freelancer withdrawal requests
- `dispute_resolution` - Dispute management
- `review` - Service reviews

### Important Columns

- `service.is_active` - For pause/activate functionality
- `freelancer.total_earned` - Tracks total earnings
- `order.status` - pending, in_progress, delivered, completed, cancelled

## 🔄 Migration Order

Migrations run in alphabetical order:

1. `00_schema.sql` - Creates all tables (including service status and withdrawal_request)
2. `03_seed_data.sql` - Inserts sample data

## ✅ Verification Steps

After setup, verify:

1. ✅ Can access frontend at http://localhost:5173
2. ✅ Can register a new user
3. ✅ Can log in with seeded admin (userID 21 or 22)
4. ✅ Admin dashboard shows analytics
5. ✅ Can browse services
6. ✅ Database has all tables (check with `\dt` in psql)

## 🆘 Troubleshooting

**Port conflicts:**

```bash
lsof -i tcp:5432  # PostgreSQL
lsof -i tcp:3000  # API
lsof -i tcp:5173  # Vite
```

**Reset database:**

```bash
docker compose down -v  # Drops DB volume
docker compose up --build -d  # Fresh start with migrations
```

**View logs:**

```bash
docker compose logs -f api
docker compose logs -f db
```

**Manual migration:**

```bash
npm run migrate
```

## 🎉 Ready to Go!

1. Clone the repo
2. Run `npm install`
3. Run `docker compose up --build -d`
4. Run `npm run dev:web`
5. Start coding!

All migrations will run automatically, and you'll have a fully functional marketplace with admin and freelancer dashboards.

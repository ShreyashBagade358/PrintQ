# PrintQ — Print Shop Management Platform

A full-featured print shop management SaaS built with Next.js 16. Multi-tenant platform connecting print shop owners, staff, and customers in one unified system with remote print server support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL 14+ via Prisma 5.22.0 ORM (Neon) |
| Auth | NextAuth v5 beta (JWT, Credentials, Google OAuth, PrismaAdapter) |
| Styling | TailwindCSS v4 + shadcn/ui (Radix primitives) |
| Animations | Framer Motion 12 |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| File Upload | Uploadthing 7.4 (S3-compatible) |
| Payments | Stripe |
| QR Scanning | html5-qrcode |
| Local Printing | CUPS / IPP (macOS/Linux system printers) |
| Remote Printing | Node.js print-server.js (CUPS bridge) |
| Notifications | Sonner toasts + in-app notification system |
| Email | Resend (placeholder) |
| Onboarding | React Joyride |

## Architecture (Full File Tree)

```
printq/
│
├── prisma/                                   # Database layer
│   └── schema.prisma                         #   26 models, 10 enums, relations
│
├── src/
│   │
│   ├── proxy.ts                              # Next.js 16 proxy (replaces middleware.ts)
│   │                                        #   Role-based route protection via NextAuth
│   │
│   ├── app/                                  # Next.js App Router pages + API
│   │   │
│   │   ├── layout.tsx                        #   Root layout: fonts, metadata, SessionProvider
│   │   ├── globals.css                       #   CSS variables, Tailwind v4 theme tokens
│   │   ├── page.tsx                          #   Home page (/)
│   │   ├── error.tsx                         #   Global error boundary
│   │   ├── not-found.tsx                     #   404 fallback
│   │   ├── favicon.ico
│   │   │
│   │   ├── auth/                             # 🔐 Authentication (8 pages)
│   │   │   ├── login/page.tsx                #     Sign-in
│   │   │   ├── register/page.tsx             #     Shop owner registration
│   │   │   ├── customer-login/page.tsx       #     Customer sign-in
│   │   │   ├── customer-register/page.tsx    #     Customer registration
│   │   │   ├── shop-login/page.tsx           #     Shop staff sign-in
│   │   │   ├── forgot-password/page.tsx      #     Password reset request
│   │   │   ├── reset-password/page.tsx       #     Set new password
│   │   │   └── verify/page.tsx               #     Email verification
│   │   │
│   │   ├── customer/                         # 👤 Customer portal (11 routes)
│   │   │   ├── dashboard/page.tsx            #     Order summary, recent activity
│   │   │   ├── upload/page.tsx               #     Drag-and-drop file upload + print options
│   │   │   ├── orders/page.tsx               #     Order history
│   │   │   ├── orders/[id]/page.tsx          #     Order detail with status timeline
│   │   │   ├── scan/page.tsx                 #     QR scanner for shop connection
│   │   │   ├── scan/[token]/page.tsx         #     Scanner with pre-filled shop token
│   │   │   ├── track/page.tsx                #     Track order by ID
│   │   │   ├── profile/page.tsx              #     Edit profile
│   │   │   ├── settings/page.tsx             #     Account settings
│   │   │   ├── notifications/page.tsx        #     In-app notifications
│   │   │   ├── support/page.tsx              #     Submit support tickets
│   │   │   └── success/page.tsx              #     Post-order success page
│   │   │
│   │   ├── shop/                             # 🏪 Shop owner / staff dashboard (13 routes)
│   │   │   ├── dashboard/page.tsx            #     Revenue, orders, queue stats, QR display
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx                  #     All orders with search + tabs
│   │   │   │   └── [id]/page.tsx             #     Order detail: timeline, files, operator settings, Print Now
│   │   │   ├── queue/page.tsx                #     Print queue: priority, printer assign, start/complete
│   │   │   ├── printers/page.tsx             #     Printer mgmt + print server connection status
│   │   │   ├── customers/page.tsx            #     Customer directory
│   │   │   ├── pricing/page.tsx              #     Per-page pricing rules
│   │   │   ├── analytics/page.tsx            #     Business analytics
│   │   │   ├── reports/page.tsx              #     Custom reports
│   │   │   ├── staff/page.tsx                #     Staff management
│   │   │   ├── billing/page.tsx              #     Billing history
│   │   │   ├── subscription/page.tsx         #     Plan management
│   │   │   ├── settings/page.tsx             #     Shop config + print server setup guide
│   │   │   ├── notifications/page.tsx        #     Shop notifications
│   │   │   └── profile/page.tsx              #     Shop profile
│   │   │
│   │   ├── public/                           # 🌐 Marketing pages (6 routes)
│   │   │   ├── landing/page.tsx              #     Landing page (composed sections)
│   │   │   ├── pricing/page.tsx              #     Pricing plans
│   │   │   ├── about/page.tsx                #     About us
│   │   │   ├── blog/page.tsx                 #     Blog listing
│   │   │   ├── contact/page.tsx              #     Contact form
│   │   │   └── help/page.tsx                 #     Help center
│   │   │
│   │   ├── legal/                            # ⚖️ Legal pages
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   ├── refund/page.tsx
│   │   │   └── security/page.tsx
│   │   │
│   │   ├── system/                           # ⚠️ System status pages
│   │   │   ├── 403/page.tsx
│   │   │   ├── 404/page.tsx
│   │   │   ├── 500/page.tsx
│   │   │   ├── 503/page.tsx
│   │   │   ├── coming-soon/page.tsx
│   │   │   ├── maintenance/page.tsx
│   │   │   └── offline/page.tsx
│   │   │
│   │   └── api/                              # ⚙️ API routes
│   │       ├── auth/[...nextauth]/route.ts   #     NextAuth handler
│   │       ├── uploadthing/route.ts          #     Uploadthing server handler
│   │       ├── print/route.ts                #     CUPS printer API (discover, print, manage)
│   │       ├── webhooks/stripe/route.ts      #     Stripe webhook receiver
│   │       ├── print-server/
│   │       │   ├── register/route.ts         #     Print server registration
│   │       │   ├── heartbeat/route.ts        #     Print server heartbeat
│   │       │   ├── status/route.ts           #     Connection health check
│   │       │   ├── jobs/push/route.ts        #     Push new print jobs
│   │       │   ├── jobs/dispatch/route.ts    #     Claim pending jobs (atomic)
│   │       │   └── jobs/[id]/status/route.ts #     Job status updates
│   │
│   ├── components/                           # 🧩 Reusable UI components
│   │   ├── ui/                               #     shadcn/ui primitives
│   │   │   ├── accordion.tsx                 #       Radix Accordion
│   │   │   ├── avatar.tsx                    #       Radix Avatar
│   │   │   ├── badge.tsx                     #       Status badge
│   │   │   ├── button.tsx                    #       Button variants + hover effects
│   │   │   ├── card.tsx                      #       Card with custom shadows
│   │   │   ├── checkbox.tsx                  #       Radix Checkbox
│   │   │   ├── dialog.tsx                    #       Radix Dialog (modals)
│   │   │   ├── dropdown-menu.tsx             #       Radix DropdownMenu
│   │   │   ├── input.tsx                     #       Form input
│   │   │   ├── label.tsx                     #       Form label
│   │   │   ├── select.tsx                    #       Radix Select
│   │   │   ├── skeleton.tsx                  #       Loading skeleton
│   │   │   ├── status-badge.tsx              #       Colored status indicator
│   │   │   ├── switch.tsx                    #       Radix Switch
│   │   │   ├── table.tsx                     #       Table component
│   │   │   ├── tabs.tsx                      #       Radix Tabs
│   │   │   ├── textarea.tsx                  #       Form textarea
│   │   │   └── theme-toggle.tsx              #       Dark/light mode toggle
│   │   ├── layout/                           #     Layout components
│   │   │   ├── sidebar.tsx                   #       Role-aware sidebar
│   │   │   ├── dashboard-navbar.tsx          #       Dashboard top navbar
│   │   │   ├── breadcrumb.tsx                #       Breadcrumb navigation
│   │   │   ├── public-navbar.tsx             #       Marketing site navbar
│   │   │   └── public-footer.tsx             #       Dark navy footer
│   │   ├── providers/                        #     React context providers
│   │   │   └── session-provider.tsx          #       NextAuth SessionProvider
│   │   ├── scan/                             #     QR scanner components
│   │   │   └── camera-scanner.tsx            #       html5-qrcode camera scanner
│   │   ├── shop/                             #     Shop-specific components
│   │   │   └── qr-display.tsx                #       Shop QR code display
│   │   └── onboarding/                       #     Tutorial system
│   │       ├── tutorial-provider.tsx         #       React Joyride provider
│   │       ├── tour-configs.tsx              #       Tour step configurations
│   │       └── tutorial-button.tsx           #       Tutorial trigger button
│   │
│   └── lib/                                  # 📚 Shared libraries
│       ├── actions/                          #     Server Actions (14 files)
│       │   ├── auth.actions.ts               #       login, register, Google OAuth
│       │   ├── customer-order.actions.ts     #       Customer order creation, tracking
│       │   ├── dashboard.actions.ts          #       getShopDashboard, getShopOrders, getShopOrderDetail
│       │   ├── notification.actions.ts       #       getNotifications, create, markRead, delete
│       │   ├── operator.actions.ts           #       Operator settings, start print with settings, accept pay-later, reprint
│       │   ├── order.actions.ts              #       createOrder, getOrders, getOrderDetail, updateStatus
│       │   ├── payment.actions.ts            #       Stripe payment intents, pay-later
│       │   ├── print-server.actions.ts       #       PrintServer CRUD, register token management
│       │   ├── printer.actions.ts            #       getPrinters, addPrinter, updateStatus, updateLevels, remove
│       │   ├── profile.actions.ts            #       getProfile, updateProfile, changePassword, getCustomerDashboard
│       │   ├── qr.actions.ts                 #       QR token generation, validation
│       │   ├── queue.actions.ts              #       getQueue, startPrint, completePrint, fail QC, assign, updatePriority
│       │   ├── report.actions.ts             #       Monthly sales, order summary, customer report, custom reports
│       │   └── shop.actions.ts               #       Shop CRUD, profile stats, duplicate getQueue
│       ├── auth.ts                           #     NextAuth initialization
│       ├── auth.config.ts                    #     Auth config: providers, callbacks, JWT, authorized()
│       ├── next-auth.d.ts                    #     NextAuth type augmentation
│       ├── prisma.ts                         #     Prisma client singleton
│       ├── stripe.ts                         #     Stripe client init
│       ├── uploadthing.ts                    #     Uploadthing file router (PDF, DOCX, images)
│       ├── print-service.ts                  #     CUPS/lp integration + remote print server routing
│       ├── print-server-utils.ts             #     Internal print server helpers
│       ├── qr-token.ts                       #     QR token creation/verification
│       ├── types.ts                          #     Shared TypeScript interfaces
│       ├── utils.ts                          #     formatCurrency, formatDateTime, cn()
│       └── constants.ts                      #     App-wide constants
│
├── print-server.js                           # Standalone remote print server (CUPS bridge)
├── generate-report.ts                        # Academic report generator (docx)
├── test-e2e.sh                               # 63 E2E endpoint tests
├── test-interaction.sh                       # 55 interaction tests
├── .env                                      # Environment variables (local)
├── .env.example                              # Environment template with docs
├── next.config.ts                            # Next.js configuration
├── tsconfig.json                             # TypeScript configuration
├── postcss.config.mjs                        # PostCSS + TailwindCSS v4
├── eslint.config.mjs                         # ESLint flat config
├── package.json                              # Dependencies + scripts
├── AGENTS.md                                 # AI agent instructions
└── CLAUDE.md                                 # Claude config
```

## Database (26 Models)

- **User** — All users with role-based access (SUPER_ADMIN, SHOP_OWNER, STAFF, CUSTOMER)
- **Account / Session / VerificationToken** — NextAuth provider accounts
- **Shop** — Print shop profile with settings, branding, QR token, timezone
- **Customer** — Per-shop customer records with order history & spending
- **Order** — Print orders with full status workflow (PENDING → RECEIVED → IN_QUEUE → PROCESSING → PRINTING → QUALITY_CHECK → READY → COMPLETED / CANCELLED / REFUNDED)
- **PrintFile** — Uploaded files attached to orders
- **QueueItem** — Print queue with priority system (LOW / NORMAL / HIGH / URGENT), printer assignment, position tracking
- **Printer** — Printer registry per shop with paper/ink levels, capabilities, status tracking
- **PricingRule** — Per-shop pricing by paper size + color type
- **Staff** — Staff membership with roles and permissions
- **Subscription / Plan** — SaaS subscription tiers
- **Invoice** — Billing invoices with Stripe integration
- **Coupon** — Discount coupons
- **Notification** — In-app notifications per user
- **Ticket / TicketMessage** — Support ticket system
- **BlogPost / CMSPage** — Content management
- **ActivityLog** — Audit trail
- **ScanEvent** — QR scan event recording
- **Setting** — Key-value app settings
- **PrintServer** — Registered remote print servers
- **PrintJob** — Cloud-to-local print dispatch jobs

## Features by Role

### Customer Portal (`/customer/*`)
- **Dashboard** — Order summary, recent activity, quick actions
- **Upload Print Job** — Drag-and-drop file upload (PDF/DOCX/images), print options (color, paper size, copies, sides, finishing), live price calculation, orientation, print quality
- **Orders** — View all orders with status tracking and detail view
- **Track Order** — Real-time order tracking by order ID
- **QR Scan** — Scan shop QR codes to connect to a specific shop
- **Profile / Settings** — Account management
- **Support** — Submit support tickets
- **Notifications** — In-app notifications

### Shop Owner / Staff (`/shop/*`)
- **Dashboard** — Revenue stats, order counts, pages printed, pending orders, queue count, printer status, Order Status Distribution chart, recent orders table, QR code display
- **Orders** — Full order management with search, status filters, order detail with timeline, file downloads, operator print settings (tray, DPI, scaling, margins), Print Now with printer selection, Mark Ready / fail quality check
- **Queue** — Print queue with priority management, printer assignment, start/complete/cancel print jobs
- **Printers** — Printer registry with remote print server connection status, add/remove, status toggle, paper/ink levels
- **Customers** — Customer directory
- **Analytics / Reports** — Business insights with custom reports (Orders, Revenue, Customers, Printers)
- **Pricing** — Configure per-page pricing rules
- **Staff** — Manage staff accounts
- **Billing / Subscription** — Plan management
- **Settings** — Shop configuration, branding, **print server setup guide**
- **Notifications** — Shop notification center

## Print System

PrintQ supports two printing paths:

### 1. Local CUPS Printing (Self-hosted)
Direct integration with the system's CUPS printing service:
- **Printer Discovery** — Scan system CUPS printers via `lpstat -p`, import with one click
- **Real Printing** — File downloaded from Uploadthing → sent to CUPS printer via `lp` command → result logged in `printNotes`
- **Operator Settings** — Per-job settings: tray, DPI, scaling, margins, orientation, pages-per-sheet, color mode, brightness/contrast

### 2. Remote Print Server Bridge (Vercel / Cloud)
For cloud-hosted deployments, a lightweight Node.js worker bridges cloud to local printers:

```
┌─────────────┐     poll /dispatch    ┌──────────────┐     lp      ┌──────────┐
│  Vercel      │ ◄────────────────── │  print-server │ ──────────►│  CUPS    │
│  (PrintQ)    │     status /push     │  (Node.js)    │            │  Printer │
└─────────────┘                      └──────────────┘            └──────────┘
```

- **print-server.js** — Single-file 150-line script, 3 env vars (`PRINTQ_URL`, `PRINTQ_TOKEN`, `PRINTQ_NAME`)
- **Atomic job claiming** — `$transaction` prevents double-dispatch
- **Poll lock guard** — No overlapping poll cycles
- **Heartbeat** — Periodic health check reporting

### Print API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/print?action=discover` | List CUPS printers on the system |
| GET | `/api/print?action=details&printer=NAME` | Get printer details |
| GET | `/api/print?action=queue` | View active CUPS print queue |
| POST | `/api/print` | Print a file, add/remove system printer |
| POST | `/api/print-server/register` | Register a print server |
| POST | `/api/print-server/heartbeat` | Server heartbeat |
| GET | `/api/print-server/status` | Connection health check |
| GET | `/api/print-server/jobs/dispatch` | Claim pending job |
| POST | `/api/print-server/jobs/push` | Push new print job |
| PATCH | `/api/print-server/jobs/[id]/status` | Update job status |

## Authentication & Authorization

- **Role-based access control** via NextAuth `authorized` callback in `src/proxy.ts`
- 4 roles: SUPER_ADMIN, SHOP_OWNER, STAFF, CUSTOMER
- Route protection:
  - `/shop/*` → SHOP_OWNER or STAFF only
  - `/customer/*` → CUSTOMER only
  - `/auth/*` → redirects logged-in users to their dashboard
- JWT session strategy with Credentials (email/password + bcrypt) and Google OAuth providers

## QR Code System

- Each shop has a unique QR token linking customers to that shop
- **QR Display** — Shown on dashboard, customer scans to connect
- **Camera Scanner** — Built-in html5-qrcode scanner with configurable overlay
- **Token Security** — 24h token expiry, secure generation, `crypto.timingSafeEqual` verification

## File Upload (Uploadthing)

- Uploadthing v7 handles file storage (S3-compatible)
- File types: PDF (32MB, up to 10), DOCX/DOC (16MB, up to 10), images PNG/JPG (16MB, up to 10)
- Flow: Client drag-and-drop → Uploadthing upload → URL stored in `PrintFile`
- Files re-downloaded from Uploadthing when sending to physical printer

## Payment Processing (Stripe)

- Stripe integration with webhook handler at `/api/webhooks/stripe`
- Payment methods: Card (Stripe Payment Intents), Pay Later (cash at shop)
- Payment status tracking: PENDING → PAID → FAILED → REFUNDED
- Invoice generation with Stripe invoice IDs

## Testing

```bash
# 63 E2E tests — endpoint availability and response codes
./test-e2e.sh

# 55 interaction tests — cross-component workflows
./test-interaction.sh
```

Test coverage: route accessibility, auth redirection, cross-role protection, QR flow, order lifecycle, payment flow, data integrity.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Neon cloud)
- npm
- CUPS (macOS: built-in, Linux: `sudo apt install cups`)

### Installation

```bash
cd printq
npm install
cp .env.example .env
```

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/printq"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
UPLOADTHING_SECRET="sk_live_..."   # Get from uploadthing.com
UPLOADTHING_APP_ID="..."           # Get from uploadthing.com

# Optional (placeholders work for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
RESEND_API_KEY="re_..."
```

### Database Setup

```bash
# Push schema to PostgreSQL (or Neon)
npx prisma db push

# (Optional) Seed with test data
npx prisma db seed

# (Optional) View data
npx prisma studio
```

### Run

```bash
npm run dev
# → http://localhost:3000
```

### Remote Print Server (optional, for cloud deployments)

```bash
# On a machine with CUPS printers:
export PRINTQ_URL="https://your-vercel-app.vercel.app"
export PRINTQ_TOKEN="<token-from-settings-page>"
export PRINTQ_NAME="office-printer-server"

node print-server.js
```

## UI & Theming

- **TailwindCSS v4** with CSS variables in `globals.css`
- Semantic color tokens: `--primary`, `--success`, `--warning`, `--nav` (dark navy)
- Custom shadow tokens: `--shadow-card`, `--shadow-dropdown`, `--shadow-modal`
- Dark mode via `.dark` class with navy-toned backgrounds
- Role-aware sidebars
- Framer Motion animations for page transitions, list entries, hover effects
- React Joyride onboarding tour for new users

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build (prisma generate + next build) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Push schema to database |
| `npx prisma db seed` | Seed test data |
| `npx prisma studio` | Open Prisma GUI |
| `./test-e2e.sh` | Run 63 E2E tests |
| `./test-interaction.sh` | Run 55 interaction tests |

## Deployment

Deploy on Vercel (recommended for Next.js):

```bash
npm run build
# Configure DATABASE_URL, NEXTAUTH_SECRET, UPLOADTHING_* in Vercel dashboard
```

For printing in production:
- **Self-hosted**: Machine must have CUPS + access to network printers
- **Vercel**: Run `print-server.js` on a local machine with CUPS printers

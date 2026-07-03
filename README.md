# PrintQ — Print Shop Management SaaS

A full-featured print shop management platform built with Next.js 16. Multi-tenant SaaS that connects print shop owners, staff, and customers in one unified system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL 14 via Prisma 5.22.0 ORM |
| Auth | NextAuth v5 beta (JWT, Credentials, Google OAuth, PrismaAdapter) |
| Styling | TailwindCSS v4 + shadcn/ui (Radix primitives) |
| Animations | Framer Motion 12 |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| File Upload | Uploadthing 7.4 (S3-compatible) |
| Payments | Stripe |
| Printing | CUPS / IPP (macOS/Linux system printers) |
| Notifications | Sonner toasts + in-app notification system |
| Email | Resend (placeholder) |

## Architecture (Full File Tree)

```
printq/
│
├── prisma/                                   # Database layer
│   ├── schema.prisma                         #   18 models, 10 enums, relations
│   └── seed.ts                               #   Test data: users, shop, printers, orders, pricing
│
├── public/                                   # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
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
│   │   ├── forbidden.tsx                     #   403 forbidden page
│   │   ├── favicon.ico
│   │   │
│   │   ├── auth/                             # 🔐 Authentication pages
│   │   │   ├── login/page.tsx                #     Sign-in with email/password
│   │   │   ├── register/page.tsx             #     Create account
│   │   │   ├── forgot-password/page.tsx      #     Password reset request
│   │   │   ├── reset-password/page.tsx       #     Set new password
│   │   │   └── verify/page.tsx               #     Email verification
│   │   │
│   │   ├── customer/                         # 👤 Customer portal
│   │   │   ├── dashboard/page.tsx            #     Order summary, recent activity
│   │   │   ├── upload/page.tsx               #     Drag-and-drop file upload + print options
│   │   │   ├── orders/page.tsx               #     Order history
│   │   │   ├── track/page.tsx                #     Track order by ID
│   │   │   ├── profile/page.tsx              #     Edit profile
│   │   │   ├── settings/page.tsx             #     Account settings
│   │   │   ├── notifications/page.tsx        #     In-app notifications
│   │   │   ├── support/page.tsx              #     Submit support tickets
│   │   │   └── success/page.tsx              #     Post-order success page
│   │   │
│   │   ├── shop/                             # 🏪 Shop owner / staff dashboard
│   │   │   ├── dashboard/page.tsx            #     Revenue, orders, queue stats
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx                  #     All orders with search + tabs
│   │   │   │   └── [id]/page.tsx             #     Order detail: timeline, files, Print Now
│   │   │   ├── queue/page.tsx                #     Print queue: priority, printer assign
│   │   │   ├── printers/page.tsx             #     Printer mgmt + CUPS discovery
│   │   │   ├── customers/page.tsx            #     Customer directory
│   │   │   ├── pricing/page.tsx              #     Per-page pricing rules
│   │   │   ├── analytics/page.tsx            #     Business analytics
│   │   │   ├── reports/page.tsx              #     Custom reports
│   │   │   ├── staff/page.tsx                #     Staff management
│   │   │   ├── billing/page.tsx              #     Billing history
│   │   │   ├── subscription/page.tsx         #     Plan management
│   │   │   ├── settings/page.tsx             #     Shop configuration
│   │   │   ├── notifications/page.tsx        #     Shop notifications
│   │   │   └── profile/page.tsx              #     Shop profile
│   │   │
│   │   ├── admin/                            # 🛡️ Super admin panel
│   │   │   ├── dashboard/page.tsx            #     Platform overview
│   │   │   ├── shops/page.tsx                #     All shops management
│   │   │   ├── users/page.tsx                #     User management
│   │   │   ├── subscriptions/page.tsx        #     Plan & subscription oversight
│   │   │   ├── payments/page.tsx             #     Transaction history
│   │   │   ├── coupons/page.tsx              #     Discount codes
│   │   │   ├── tickets/page.tsx              #     Support tickets
│   │   │   ├── blog/page.tsx                 #     Blog posts
│   │   │   ├── cms/page.tsx                  #     CMS pages
│   │   │   ├── activity/page.tsx             #     Audit log
│   │   │   ├── settings/page.tsx             #     Global settings
│   │   │   └── help/page.tsx                 #     Help / docs
│   │   │
│   │   ├── public/                           # 🌐 Marketing pages
│   │   │   ├── landing/
│   │   │   │   ├── page.tsx                  #     Landing page (composed sections)
│   │   │   │   ├── hero.tsx                  #     Hero section
│   │   │   │   ├── features.tsx              #     Features grid
│   │   │   │   ├── benefits.tsx              #     Benefits section
│   │   │   │   ├── how-it-works.tsx          #     Step-by-step guide
│   │   │   │   ├── testimonials.tsx          #     Customer testimonials
│   │   │   │   ├── trusted-shops.tsx         #     Trusted by logos
│   │   │   │   ├── faq.tsx                   #     FAQ accordion
│   │   │   │   └── cta-banner.tsx            #     Call-to-action banner
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
│   │       └── webhooks/stripe/route.ts      #     Stripe webhook receiver
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
│   │   │   ├── select.tsx                    #       Radix Select
│   │   │   ├── skeleton.tsx                  #       Loading skeleton
│   │   │   ├── status-badge.tsx              #       Colored status indicator
│   │   │   ├── switch.tsx                    #       Radix Switch
│   │   │   ├── table.tsx                     #       Table component
│   │   │   ├── tabs.tsx                      #       Radix Tabs
│   │   │   └── textarea.tsx                  #       Form textarea
│   │   ├── layout/                           #     Layout components
│   │   │   ├── sidebar.tsx                   #       Role-aware sidebar (admin = dark navy)
│   │   │   ├── dashboard-navbar.tsx          #       Dashboard top navbar
│   │   │   ├── breadcrumb.tsx                #       Breadcrumb navigation
│   │   │   ├── public-navbar.tsx             #       Marketing site navbar
│   │   │   └── public-footer.tsx             #       Dark navy footer
│   │   └── providers/                        #     React context providers
│   │       └── session-provider.tsx          #       NextAuth SessionProvider
│   │
│   └── lib/                                  # 📚 Shared libraries
│       ├── actions/                          #     Server Actions (all "use server")
│       │   ├── auth.actions.ts               #       login, register
│       │   ├── order.actions.ts              #       createOrder, getOrders, getOrderDetail, updateStatus
│       │   ├── queue.actions.ts              #       getQueue, startPrint, completePrint, assignPrinter, updatePriority
│       │   ├── printer.actions.ts            #       getPrinters, addPrinter, updateStatus, updateLevels, remove
│       │   ├── dashboard.actions.ts          #       getShopDashboard, getShopOrders, getShopOrderDetail
│       │   ├── notification.actions.ts       #       getNotifications, create, markRead, delete
│       │   ├── shop.actions.ts               #       Shop CRUD
│       │   └── admin.actions.ts              #       Admin operations
│       ├── auth.ts                           #     NextAuth initialization
│       ├── auth.config.ts                    #     Auth config: providers, callbacks, JWT, authorized()
│       ├── next-auth.d.ts                    #     NextAuth type augmentation
│       ├── prisma.ts                         #     Prisma client singleton
│       ├── stripe.ts                         #     Stripe client init
│       ├── uploadthing.ts                    #     Uploadthing file router (PDF, DOCX, images)
│       ├── print-service.ts                  #     CUPS/lp integration (discover, print, manage printers)
│       ├── types.ts                          #     Shared TypeScript interfaces
│       ├── utils.ts                          #     formatCurrency, formatDateTime, cn()
│       └── constants.ts                      #     App-wide constants
│
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
```

## Database (18 Models)

- **User** — All users with role-based access (SUPER_ADMIN, SHOP_OWNER, STAFF, CUSTOMER)
- **Account / Session / VerificationToken** — NextAuth provider accounts
- **Shop** — Print shop profile with settings, branding, timezone
- **Customer** — Per-shop customer records with order history & spending
- **Order** — Print orders with status workflow (PENDING → RECEIVED → PROCESSING → PRINTING → READY → COMPLETED / CANCELLED / REFUNDED)
- **PrintFile** — Uploaded files attached to orders
- **QueueItem** — Print queue with priority system (LOW / NORMAL / HIGH / URGENT), printer assignment, status tracking
- **Printer** — Printer registry per shop with paper/ink levels, capabilities, status (ONLINE / OFFLINE / BUSY / ERROR)
- **PricingRule** — Per-shop pricing by paper size + color type
- **Staff** — Staff membership with roles and permissions
- **Subscription / Plan** — SaaS subscription tiers
- **Invoice** — Billing invoices with Stripe integration
- **Coupon** — Discount coupons
- **Notification** — In-app notifications per user
- **Ticket / TicketMessage** — Support ticket system
- **BlogPost / CMSPage** — Content management
- **ActivityLog** — Audit trail
- **Setting** — Key-value app settings

## Features by Role

### Customer Portal (`/customer/*`)
- **Dashboard** — Order summary, recent activity, quick actions
- **Upload Print Job** — Drag-and-drop file upload with Uploadthing, print options (color, paper size, copies, sides, finishing), live price calculation
- **Orders** — View all orders with status tracking
- **Track Order** — Real-time order tracking by order ID
- **Profile / Settings** — Account management
- **Support** — Submit support tickets
- **Notifications** — In-app notifications

### Shop Owner / Staff (`/shop/*`)
- **Dashboard** — Revenue stats, orders overview, pending queue count, recent orders table
- **Orders** — Full order management with search, status filters (All/Active/Completed/Cancelled), order detail with timeline, file downloads, Print Now with printer selection, Mark Ready
- **Queue** — Print queue with priority management, printer assignment, start/complete print jobs
- **Printers** — Printer registry with CUPS discovery, paper/ink level monitoring, status toggle, remove
- **Customers** — Customer directory
- **Analytics / Reports** — Business insights
- **Pricing** — Configure per-page pricing rules
- **Staff** — Manage staff accounts
- **Billing / Subscription** — Plan management
- **Settings** — Shop configuration, branding, notifications

### Admin (`/admin/*`)
- **Dashboard** — Platform-wide analytics
- **Shops** — Manage all shops
- **Users** — User management
- **Subscriptions** — Plan & subscription oversight
- **Blog / CMS** — Content management
- **Coupons** — Discount code management
- **Payments** — Transaction overview
- **Tickets** — Support ticket administration
- **Activity Log** — Platform audit trail
- **Settings** — Global configuration

## Printing System (CUPS / IPP)

PrintQ integrates with the system's CUPS printing service for real printer communication:

- **Printer Discovery** — Scan system CUPS printers via `lpstat -p`, import into the app with one click
- **Manual Add** — Add printers by name/model or IPP URI (`ipp://192.168.1.50/ipp/print`)
- **Real Printing** — When "Start Print" is clicked in the queue or order detail:
  1. File is downloaded from Uploadthing
  2. Sent to the assigned CUPS printer via `lp` command
  3. Print job result logged in order's `printNotes`
  4. Printer status set to BUSY, queue item to PRINTING
- **Network Printers** — Supports IPP, IPPS, LPD, SMB, and socket protocols via CUPS
- **Test Printer** — `PrintQ-Test` CUPS printer installed for development/testing

### Print API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/print?action=discover` | List CUPS printers on the system |
| GET | `/api/print?action=details&printer=NAME` | Get printer details |
| GET | `/api/print?action=queue` | View active CUPS print queue |
| POST | `/api/print` | Print a file, add/remove system printer |

## Authentication & Authorization

- **Role-based access control** via NextAuth `authorized` callback in `src/proxy.ts`
- Route protection:
  - `/shop/*` → SHOP_OWNER or STAFF only (redirects CUSTOMER to `/customer/dashboard`)
  - `/customer/*` → CUSTOMER only (redirects others to `/shop/dashboard`)
  - `/admin/*` → SUPER_ADMIN only
  - `/auth/*` → redirects logged-in users to their role-based dashboard
- JWT session strategy with Credentials (email/password + bcrypt) and Google OAuth providers
- Login credentials:
  - Owner: `owner@printq.test` / `password123`
  - Customer: `customer@test.com` / `password123`

## File Upload (Uploadthing)

- Uploadthing v7 handles file storage (S3-compatible)
- File types: PDF (32MB, up to 10), DOCX/DOC (16MB, up to 10), images PNG/JPG (16MB, up to 10)
- Flow: Client-side drag-and-drop → Uploadthing upload → Persistent URL stored in `PrintFile` record
- Files are re-downloaded from Uploadthing when sending to a physical printer

## Payment Processing (Stripe)

- Stripe integration ready with webhook handler at `/api/webhooks/stripe`
- Payment status tracking: PENDING → PAID → FAILED → REFUNDED
- Invoice generation with Stripe invoice IDs
- Requires real Stripe API keys in `.env`

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm / pnpm / yarn
- CUPS (macOS: built-in, Linux: `sudo apt install cups`)

### Installation

```bash
# Clone and install
cd printq
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/printq"
NEXTAUTH_SECRET="generate-a-random-secret"
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
# Push schema to PostgreSQL
npx prisma db push

# Seed with test data
npx prisma db seed

# (Optional) View data
npx prisma studio
```

### Run

```bash
npm run dev
# → http://localhost:3000
```

## UI & Theming

- **TailwindCSS v4** with CSS variables in `globals.css`
- Semantic color tokens: `--primary`, `--success` (green), `--warning` (amber), `--nav` (dark navy)
- Custom shadow tokens: `--shadow-card`, `--shadow-dropdown`, `--shadow-modal`, `--shadow-button`
- Dark mode via `.dark` class with navy-toned backgrounds
- Role-aware sidebars: Admin uses `bg-nav` (dark navy), shop/customer use `bg-background`
- Framer Motion animations throughout for page transitions, list entries, hover effects

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Push schema to database |
| `npx prisma db seed` | Seed test data |
| `npx prisma studio` | Open Prisma GUI |

## Deployment

Deploy on Vercel (recommended for Next.js):

```bash
npm run build
# Configure DATABASE_URL, NEXTAUTH_SECRET, UPLOADTHING_* in Vercel dashboard
```

For the printing system to work in production, the server must have CUPS installed and access to network printers.
# PrintQ

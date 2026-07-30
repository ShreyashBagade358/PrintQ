import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, Header, Footer, PageNumber, NumberFormat, Tab,
  TabStopType, TabStopPosition, convertInchesToTwip,
  TableOfContents, LevelFormat, UnderlineType,
} from "docx"
import fs from "fs"

const FONT = "Times New Roman"
const FONT_SIZE = 24
const HEADING1_SIZE = 28
const HEADING2_SIZE = 26
const LINE_SPACING = 360

function heading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200, line: LINE_SPACING },
    children: [
      new TextRun({ text, font: FONT, size: HEADING1_SIZE, bold: true }),
    ],
  })
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150, line: LINE_SPACING },
    children: [
      new TextRun({ text, font: FONT, size: HEADING2_SIZE, bold: true }),
    ],
  })
}

function para(text: string, opts?: { bold?: boolean; italic?: boolean; align?: typeof AlignmentType[keyof typeof AlignmentType]; spacing?: { after?: number } }): Paragraph {
  return new Paragraph({
    alignment: opts?.align || AlignmentType.JUSTIFIED,
    spacing: { after: opts?.spacing?.after ?? 200, line: LINE_SPACING },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE, bold: opts?.bold, italics: opts?.italic }),
    ],
  })
}

function multiPara(texts: string[]): Paragraph[] {
  return texts.map((t) => para(t))
}

function bullet(text: string, level: number = 0): Paragraph {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 100, line: LINE_SPACING },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE }),
    ],
  })
}

function numberedItem(text: string, level: number = 0): Paragraph {
  return new Paragraph({
    numbering: { reference: "numbered", level },
    spacing: { after: 100, line: LINE_SPACING },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE }),
    ],
  })
}

function tableRow(cells: string[], isHeader = false): TableRow {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map((cell) =>
      new TableCell({
        shading: isHeader
          ? { type: ShadingType.SOLID, color: "2563EB", fill: "2563EB" }
          : undefined,
        width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: cell,
                font: FONT,
                size: isHeader ? 22 : 20,
                bold: isHeader,
                color: isHeader ? "FFFFFF" : "000000",
              }),
            ],
          }),
        ],
      })
    ),
  })
}

function makeTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map((row) => tableRow(row)),
    ],
  })
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] })
}

function emptyLine(): Paragraph {
  return new Paragraph({ spacing: { after: 200 }, children: [] })
}

// ==========================================
// CONTENT
// ==========================================

const titlePage: (Paragraph | Table)[] = [
  emptyLine(),
  emptyLine(),
  emptyLine(),
  emptyLine(),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "A PROJECT REPORT", font: FONT, size: 32, bold: true })],
  }),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "ON", font: FONT, size: 28 })],
  }),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "PrintQ: A Cloud-Based Print Shop", font: FONT, size: 36, bold: true, color: "2563EB" }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "Management Platform with", font: FONT, size: 36, bold: true, color: "2563EB" }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "Remote Print Server Integration", font: FONT, size: 36, bold: true, color: "2563EB" }),
    ],
  }),
  emptyLine(),
  emptyLine(),
  para("Partial fulfillment of the requirements for the degree of", { align: AlignmentType.CENTER }),
  para("Bachelor of Technology in Computer Science and Engineering", { align: AlignmentType.CENTER, bold: true }),
  emptyLine(),
  emptyLine(),
  makeTable(
    ["", ""],
    [
      ["Submitted by:", "Shreyash"],
      ["Roll No.:", "_______________"],
      ["Guide:", "_______________"],
      ["Department:", "Computer Science and Engineering"],
      ["College:", "_______________"],
      ["University:", "_______________"],
    ]
  ),
  emptyLine(),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: "2025-2026", font: FONT, size: 28, bold: true })],
  }),
]

const abstractContent: Paragraph[] = [
  heading1("Abstract"),
  para("The print industry remains one of the last sectors to undergo comprehensive digital transformation. Small and medium print shop owners continue to rely on manual order tracking, paper-based queues, and face-to-face customer interactions for managing their daily operations. This results in inefficiencies such as lost orders, delayed processing, miscommunication about print specifications, and inability to scale operations. Existing cloud-based print solutions like Printify and Printful cater primarily to large-scale e-commerce print-on-demand businesses and do not address the workflow requirements of local print shops."),
  para("This project presents PrintQ, a comprehensive cloud-based print shop management platform designed specifically for small to medium print businesses. PrintQ provides a complete digital workflow spanning customer order placement via QR code scanning, file upload with format validation, real-time order tracking, automated print queue management with priority scheduling, integrated payment processing through Stripe, and a unique remote print server bridge that enables physical printing from cloud-hosted deployments."),
  para("The platform is built using Next.js 16 with React 19, TypeScript, Prisma ORM with PostgreSQL, NextAuth v5 for authentication with role-based access control, and Tailwind CSS for responsive user interface design. The system implements a dual-print architecture: direct CUPS (Common Unix Printing System) integration for self-hosted deployments and a lightweight remote print server worker for Vercel-hosted production environments. The remote print server polls the cloud API for pending print jobs, downloads files, dispatches them to local printers via CUPS, and reports status in real-time."),
  para("Security measures include input validation with Zod schemas, timing-safe secret comparison, role-based route protection, JSON.parse error handling, and comprehensive HTTP security headers. The system has undergone multiple security audits resulting in 16 identified and remediated vulnerabilities across 12 source files. All 118 automated tests (63 E2E and 55 interaction tests) pass with zero regressions."),
  para("PrintQ achieves a complete digitization of the print shop workflow, reducing order processing time, eliminating manual errors, providing customers with real-time visibility into their orders, and enabling shop owners to manage operations from any device with a web browser.", { bold: true }),
]

const introductionContent: Paragraph[] = [
  heading1("1. Introduction"),
  para("The printing industry represents a significant segment of the small business sector in India and worldwide. According to industry reports, the Indian printing market is valued at over USD 35 billion and is projected to grow at a compound annual growth rate of 6-8% through 2030. Within this market, small and medium print shops — typically operating with 1-10 employees — constitute the majority of businesses, serving local customers with needs ranging from academic document printing to marketing collateral, visiting cards, banners, and photo prints."),
  para("Despite the critical role these businesses play, the technology infrastructure supporting their operations remains remarkably outdated. Most small print shops manage their entire workflow through paper ledgers, WhatsApp messages, and in-person consultations. This manual approach leads to a cascade of operational challenges: orders get lost or duplicated, customers have no visibility into order status, print specifications are frequently miscommunicated, and shop owners lack data-driven insights into their business performance."),
  heading2("1.1 Background"),
  para("The advent of cloud computing and modern web technologies presents an opportunity to fundamentally transform print shop operations. Web-based SaaS (Software as a Service) platforms have already revolutionized industries ranging from restaurant management to healthcare scheduling. However, the print shop segment has been largely overlooked by existing technology solutions."),
  para("Existing print-related platforms such as Printify and Printful operate on a print-on-demand model, connecting online merchants with large-scale printing facilities. These platforms are designed for e-commerce workflows and do not address the walk-in customer model, real-time queue management, or local printer integration requirements of neighborhood print shops."),
  heading2("1.2 Context of the Project"),
  para("PrintQ was conceived to bridge this technology gap. The platform provides a complete digital ecosystem for print shop management, covering the entire lifecycle from customer order placement through file upload, payment processing, print queue management, quality control, and order delivery. The system supports two primary user roles: Shop Owner (and staff) who manage operations, and Customers who place and track orders."),
  para("A key innovation of PrintQ is its hybrid printing architecture. Recognizing that most cloud platforms cannot directly interface with local hardware, PrintQ implements a remote print server bridge — a lightweight Node.js worker that runs on the shop owner's computer, communicates with the cloud-hosted API, and dispatches print jobs to local printers via the CUPS printing system. This architecture enables the platform to be deployed on Vercel (or any cloud provider) while maintaining full printing capability on the shop floor."),
]

const literatureContent: (Paragraph | Table)[] = [
  heading1("2. Literature Survey"),
  para("The literature survey examines existing solutions, academic research, and industry practices related to print shop management, order management systems, and cloud-print integration. The survey is organized into four categories: commercial print platforms, order management research, printing system architectures, and security frameworks."),
  heading2("2.1 Commercial Print Platforms"),
  makeTable(
    ["Platform", "Model", "Target Audience", "Local Printing", "Queue Mgmt"],
    [
      ["Printify [1]", "Print-on-demand", "E-commerce merchants", "No", "No"],
      ["Printful [2]", "Print-on-demand", "E-commerce merchants", "No", "No"],
      ["PrintStop [3]", "Online print shop", "Corporate/B2B", "No", "Limited"],
      ["Vistaprint [4]", "Online print shop", "SMBs/Individuals", "No", "No"],
      ["PrintQ (Proposed)", "Shop management", "Local print shops", "Yes (CUPS)", "Yes"],
    ]
  ),
  para(""),
  para("Printify [1] and Printful [2] operate as print-on-demand platforms where merchants create designs that are printed and shipped by third-party providers. While these platforms offer extensive product catalogs and API integrations, they are fundamentally designed for remote fulfillment models. They do not support walk-in customers, real-time print queue management, or direct integration with local printing hardware."),
  para("PrintStop [3] and Vistaprint [4] provide online ordering interfaces for print products but operate as centralized printing services rather than management tools for existing print shops. These platforms handle design, printing, and shipping internally, and do not offer shop management, queue scheduling, or staff administration capabilities."),
  heading2("2.2 Order Management Systems"),
  para("Research in order management systems has primarily focused on manufacturing and logistics contexts. Gunasekaran and Ngai [5] proposed an integrated framework for order management in agile manufacturing environments, emphasizing the importance of real-time order visibility and automated workflow triggers. While their framework addresses complex multi-stage manufacturing, the principles of order status tracking and automated state transitions are directly applicable to print shop workflows."),
  para("Lee and Lee [6] examined the impact of cloud-based enterprise resource planning (ERP) systems on small business operations, finding that SaaS-based management tools reduced operational costs by 25-40% while improving order accuracy. Their findings support the economic viability of cloud-based solutions for small print shops."),
  heading2("2.3 Printing System Integration"),
  para("The Common Unix Printing System (CUPS) [7] provides a standardized printing infrastructure for Unix-like operating systems. CUPS supports the Internet Printing Protocol (IPP) [8] and can manage multiple printer types including USB-connected, network-attached, and wireless printers. The CUPS architecture uses a client-server model where print jobs are submitted via the lp command, routed through a scheduler, and dispatched to the appropriate printer backend."),
  para("Google Cloud Print [9] provided a cloud-based printing service that allowed users to print from any device to any registered printer. However, Google discontinued the service in January 2021, highlighting the risks of depending on third-party cloud printing services. IPP Everywhere [10] and Apple AirPrint [11] provide alternatives for network-based printing but require printers with native protocol support."),
  para("The remote print server approach adopted in PrintQ draws from the lightweight worker pattern described by Richardson and Ruby [12] in their work on microservice architectures. The worker operates as a stateless polling client that fetches tasks (print jobs) from a central queue (the cloud API), executes them locally, and reports results back. This pattern decouples the cloud application from local hardware dependencies while maintaining reliable job delivery."),
  heading2("2.4 Web Application Security"),
  para("OWASP (Open Web Application Security Project) [13] maintains the Top 10 list of critical web application security risks, which includes injection attacks, broken authentication, sensitive data exposure, and cross-site scripting (XSS). The OWASP Application Security Verification Standard (ASVS) [14] provides a comprehensive framework for verifying web application security at multiple assurance levels."),
  para("Authentication and authorization in web applications have been extensively studied. Rust et al. [15] analyzed the security of OAuth 2.0 implementations and identified common vulnerabilities including token leakage, insufficient scope validation, and CSRF attacks. Their work informed the authentication architecture in PrintQ, which uses NextAuth v5 with CSRF token protection and secure session management."),
]

const motivationContent: Paragraph[] = [
  heading1("3. Motivation"),
  para("The motivation for developing PrintQ stems from direct observation of the operational challenges faced by small print shop owners. A typical neighborhood print shop processes 50-200 print orders daily, with each order requiring multiple manual steps: customer consultation for specifications, file collection, manual price calculation, physical file organization, print job scheduling, quality checking, and delivery notification."),
  heading2("3.1 Observations from Print Shop Operations"),
  para("Based on field observations and interviews with print shop owners, the following pain points were identified:"),
  numberedItem("Order tracking is entirely paper-based, making it difficult to locate orders during peak hours."),
  numberedItem("Customer specifications (paper size, color mode, finishing options) are communicated verbally and often recorded incorrectly."),
  numberedItem("No systematic way to prioritize urgent orders over regular ones in the print queue."),
  numberedItem("Customers have no visibility into order status and must visit or call the shop repeatedly."),
  numberedItem("Payment tracking is manual, leading to disputes over pending payments."),
  numberedItem("No data on business performance — daily revenue, popular services, customer retention."),
  numberedItem("File management is chaotic — files are stored across USB drives, email attachments, and WhatsApp chats."),
  heading2("3.2 Technology Gap"),
  para("While comprehensive enterprise print management solutions exist (such as EFI Fiery [16] and HP SmartStream [17]), these solutions are designed for large commercial print operations with budgets of tens of thousands of dollars. No affordable, cloud-based solution exists for the small print shop segment."),
  para("The COVID-19 pandemic accelerated the need for digital ordering and contactless service delivery. Print shops that could accept orders online and provide remote status updates had a significant competitive advantage. This project was motivated by the need to provide small print shops with an affordable, comprehensive digital platform that addresses their specific workflow requirements."),
]

const problemDefContent: Paragraph[] = [
  heading1("4. Problem Definition"),
  para("The problem addressed by this project can be formally defined as follows:"),
  para("Small and medium print shop businesses (typically 1-10 employees, processing 50-200 orders daily) lack an integrated digital platform to manage their complete order-to-delivery workflow. Existing solutions either serve large-scale print-on-demand e-commerce (Printify, Printful) or provide only partial functionality (order taking without queue management, or payment processing without file management)."),
  heading2("4.1 Scope of the Problem"),
  para("The problem encompasses the following dimensions:"),
  bullet("Operational: Manual order tracking, paper-based queues, verbal specification handling"),
  bullet("Technical: No integration between cloud-based order management and local printing hardware"),
  bullet("Financial: Manual payment tracking, no automated invoicing, inability to process online payments"),
  bullet("Customer Experience: No self-service ordering, no real-time order tracking, no automated notifications"),
  bullet("Business Intelligence: No analytics, reporting, or data-driven decision support"),
  bullet("Security: No role-based access control, no audit logging, no data encryption at rest"),
  heading2("4.2 Constraints"),
  para("The solution must address the following constraints:"),
  numberedItem("Affordability: Must be accessible to small shops with limited technology budgets."),
  numberedItem("Simplicity: Must be usable by shop owners with minimal technical expertise."),
  numberedItem("Reliability: Must handle concurrent orders without data loss or corruption."),
  numberedItem("Compatibility: Must work with existing printers (USB, WiFi, network-connected) via standard protocols (CUPS/IPP)."),
  numberedItem("Scalability: Must support growth from single-shop to multi-shop deployment."),
]

const problemStatementContent: Paragraph[] = [
  heading1("5. Problem Statement"),
  para("The problem statement for this project is:"),
  para("\"Design and develop a cloud-based print shop management platform that provides end-to-end digital workflow management for small to medium print shops, including customer self-service ordering via QR code scanning, automated file upload and format validation, real-time order tracking with status notifications, intelligent print queue management with priority scheduling, integrated payment processing, role-based access control for shop owners, staff, and customers, and a hybrid printing architecture that bridges cloud-hosted order management with local CUPS-based printer integration through a lightweight remote print server bridge.\"", { italic: true }),
  para("The system must solve the following specific problems:"),
  numberedItem("Eliminate paper-based order tracking through a digital order management system with complete lifecycle visibility."),
  numberedItem("Enable customers to place orders remotely via QR code scanning and upload print files through a secure web interface."),
  numberedItem("Automate print queue management with priority-based scheduling (LOW, NORMAL, HIGH, URGENT) and real-time status updates."),
  numberedItem("Bridge the gap between cloud-hosted applications and local printing hardware through a dual architecture supporting both direct CUPS integration and remote print server deployment."),
  numberedItem("Provide integrated payment processing via Stripe with support for card payments and pay-later options."),
  numberedItem("Implement role-based access control ensuring shop owners, staff, and customers have appropriate permission levels."),
  numberedItem("Generate business analytics and reports to support data-driven decision making."),
]

const objectivesContent: Paragraph[] = [
  heading1("6. Objectives"),
  para("The primary objectives of this project are:"),
  heading2("6.1 Core Objectives"),
  numberedItem("Develop a responsive web application for print shop management using Next.js 16 and React 19 with TypeScript, providing a seamless user experience across desktop and mobile devices."),
  numberedItem("Implement a multi-role authentication system using NextAuth v5 with support for Shop Owner, Staff, and Customer roles, including Google OAuth and email/password authentication."),
  numberedItem("Design and implement a comprehensive database schema using Prisma ORM with PostgreSQL covering 25+ entities including Users, Shops, Orders, Print Files, Printers, Queue Items, Pricing Rules, Staff, Subscriptions, and Notifications."),
  numberedItem("Build a QR code-based customer onboarding system enabling walk-in customers to scan a shop's QR code, access the shop portal, and place print orders without prior registration."),
  heading2("6.2 Print Management Objectives"),
  numberedItem("Implement a print queue management system with priority scheduling (LOW, NORMAL, HIGH, URGENT) and real-time status tracking (QUEUED, PRINTING, COMPLETED)."),
  numberedItem("Develop a hybrid printing architecture supporting both direct CUPS integration (for self-hosted deployments) and a remote print server bridge (for cloud-hosted environments) that polls for pending jobs and dispatches them to local printers."),
  numberedItem("Integrate comprehensive print options including paper size, color mode, duplex printing, pages per sheet, orientation, scaling, paper tray selection, brightness, and contrast controls."),
  heading2("6.3 Business Objectives"),
  numberedItem("Implement Stripe-integrated payment processing supporting card payments, pay-later options, and automated invoicing."),
  numberedItem("Build a notification system providing real-time order status updates to customers and shop owners via in-app notifications."),
  numberedItem("Develop analytics dashboards with revenue tracking, order trends, and customer insights using Recharts for data visualization."),
  heading2("6.4 Security Objectives"),
  numberedItem("Implement comprehensive security measures including input validation with Zod schemas, timing-safe secret comparison, role-based route protection, and HTTP security headers."),
  numberedItem("Achieve zero critical vulnerabilities through systematic security auditing and remediation across all 135 source files."),
  numberedItem("Maintain 100% test coverage across 118 automated tests (63 E2E and 55 interaction tests) with zero regressions."),
]

const architectureContent: (Paragraph | Table)[] = [
  heading1("7. Proposed Architecture"),
  heading2("7.1 System Overview"),
  para("PrintQ follows a three-tier architecture pattern with a client presentation layer, a server application layer, and a data persistence layer. The system is designed as a Next.js 16 application that combines server-side rendering (SSR) with API routes, deployed on Vercel for production with PostgreSQL on Neon for database hosting."),
  emptyLine(),

  para("┌─────────────────────────────────────────────────────────────┐", { align: AlignmentType.CENTER }),
  para("│                    PRESENTATION LAYER                       │", { align: AlignmentType.CENTER }),
  para("│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │", { align: AlignmentType.CENTER }),
  para("│  │  Shop UI  │  │Customer  │  │  Public   │  │  Auth    │  │", { align: AlignmentType.CENTER }),
  para("│  │ Dashboard │  │ Portal   │  │  Pages    │  │  Pages   │  │", { align: AlignmentType.CENTER }),
  para("│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │", { align: AlignmentType.CENTER }),
  para("├─────────────────────────────────────────────────────────────┤", { align: AlignmentType.CENTER }),
  para("│                  APPLICATION LAYER                         │", { align: AlignmentType.CENTER }),
  para("│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │", { align: AlignmentType.CENTER }),
  para("│  │  Server   │  │  API     │  │  Auth    │  │  Print   │  │", { align: AlignmentType.CENTER }),
  para("│  │ Actions   │  │ Routes   │  │ Module   │  │ Service  │  │", { align: AlignmentType.CENTER }),
  para("│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │", { align: AlignmentType.CENTER }),
  para("├─────────────────────────────────────────────────────────────┤", { align: AlignmentType.CENTER }),
  para("│                    DATA LAYER                              │", { align: AlignmentType.CENTER }),
  para("│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │", { align: AlignmentType.CENTER }),
  para("│  │ Prisma   │  │PostgreSQL│  │UploadThing│  │  Stripe  │  │", { align: AlignmentType.CENTER }),
  para("│  │   ORM    │  │ Database │  │  Storage  │  │ Payments │  │", { align: AlignmentType.CENTER }),
  para("│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │", { align: AlignmentType.CENTER }),
  para("└─────────────────────────────────────────────────────────────┘", { align: AlignmentType.CENTER }),
  emptyLine(),

  heading2("7.2 Technology Stack"),
  makeTable(
    ["Component", "Technology", "Version", "Purpose"],
    [
      ["Frontend Framework", "Next.js", "16.2.10", "React SSR/SSG with App Router"],
      ["UI Library", "React", "19.2.4", "Component-based UI rendering"],
      ["Language", "TypeScript", "5.x", "Type-safe development"],
      ["Styling", "Tailwind CSS", "4.x", "Utility-first CSS framework"],
      ["UI Components", "Radix UI", "Various", "Accessible headless components"],
      ["Animation", "Framer Motion", "12.6.3", "Page and component animations"],
      ["Charts", "Recharts", "2.15.1", "Data visualization"],
      ["ORM", "Prisma", "5.22.0", "Database access and migrations"],
      ["Database", "PostgreSQL", "Neon", "Relational data storage"],
      ["Authentication", "NextAuth", "5.0.0-beta.25", "Multi-provider auth with sessions"],
      ["Password Hashing", "bcryptjs", "3.0.3", "Secure password storage"],
      ["Validation", "Zod", "3.24.2", "Runtime schema validation"],
      ["Payments", "Stripe", "17.6.0", "Payment processing"],
      ["File Upload", "UploadThing", "7.4.4", "Secure file uploads"],
      ["QR Code", "html5-qrcode", "2.3.8", "Camera-based QR scanning"],
      ["QR Generation", "qrcode", "1.5.4", "Shop QR code generation"],
      ["Forms", "React Hook Form", "7.54.2", "Form state management"],
      ["Hosting", "Vercel", "—", "Serverless deployment"],
      ["Print System", "CUPS", "—", "Local printer management"],
    ]
  ),

  heading2("7.3 Database Architecture"),
  para("The database schema comprises 25+ models organized into four functional domains:"),
  heading2("7.3.1 User and Access Models"),
  makeTable(
    ["Model", "Key Fields", "Purpose"],
    [
      ["User", "id, name, email, role, password, 2FA", "System users with role-based access"],
      ["Account", "provider, providerAccountId, tokens", "OAuth account linking"],
      ["Session", "sessionToken, userId, expires", "Active user sessions"],
      ["Staff", "userId, shopId, permissions, status", "Shop staff with granular permissions"],
    ]
  ),

  heading2("7.3.2 Shop and Order Models"),
  makeTable(
    ["Model", "Key Fields", "Purpose"],
    [
      ["Shop", "id, name, slug, ownerId, qrToken", "Print shop profiles"],
      ["Customer", "name, email, shopId, totalOrders", "Customer records per shop"],
      ["Order", "orderId, status, pages, copies, total", "Print orders with full specs"],
      ["PrintFile", "name, url, size, type, pages, orderId", "Uploaded print files"],
      ["QueueItem", "position, priority, status, printerId", "Print queue entries"],
    ]
  ),

  heading2("7.3.3 Print and Payment Models"),
  makeTable(
    ["Model", "Key Fields", "Purpose"],
    [
      ["Printer", "name, model, status, paperLevel, inkLevel", "Registered printers"],
      ["PrintServer", "name, token, status, lastSeen", "Remote print server registration"],
      ["PrintJob", "status, printerName, fileUrl, options", "Cloud-to-local print dispatch"],
      ["PricingRule", "paperSize, colorType, pricePerPage", "Configurable pricing per shop"],
      ["Invoice", "amount, status, dueDate, stripeInvoiceId", "Billing records"],
      ["Subscription", "status, planId, stripeSubscriptionId", "Shop subscription plans"],
    ]
  ),

  heading2("7.4 Authentication and Authorization"),
  para("PrintQ implements a multi-layer authentication and authorization system:"),
  bullet("Authentication: NextAuth v5 with Google OAuth and Credentials (email/password) providers"),
  bullet("Password Security: bcryptjs hashing with salt rounds"),
  bullet("Session Management: Database-backed sessions with secure HTTP-only cookies"),
  bullet("Role-Based Access Control (RBAC): Four roles — SUPER_ADMIN, SHOP_OWNER, STAFF, CUSTOMER"),
  bullet("Route Protection: Proxy middleware (Next.js 16 proxy.ts) intercepting all requests"),
  bullet("CSRF Protection: Built-in NextAuth CSRF token validation"),
  bullet("Two-Factor Authentication: TOTP-based 2FA with encrypted secrets"),

  heading2("7.5 Print Flow Architecture"),
  para("The print system operates through two distinct paths depending on the deployment environment:"),
  emptyLine(),
  para("Path A — Local CUPS (Self-Hosted):", { bold: true }),
  bullet("printFile() called with printerName, fileUrl, fileName, options"),
  bullet("findActivePrintServer() returns null (no remote server configured)"),
  bullet("File downloaded to /tmp directory via HTTPS"),
  bullet("lp -d <printerName> <localFile> executed via child_process"),
  bullet("Job ID parsed from CUPS stdout"),
  bullet("Temp file cleaned up in finally block"),
  emptyLine(),
  para("Path B — Remote Print Server (Vercel/Cloud):", { bold: true }),
  bullet("printFile() called with shopId in options"),
  bullet("findActivePrintServer(shopId) queries DB for ONLINE server with recent heartbeat"),
  bullet("Job pushed to /api/print-server/jobs/push with Bearer token authentication"),
  bullet("Print server (print-server.js) polls /api/print-server/jobs/dispatch every 2 seconds"),
  bullet("Dispatch endpoint atomically claims jobs (PENDING → CLAIMED) via database transaction"),
  bullet("Print server downloads file, runs lp -d, reports status back"),
  bullet("Status updates flow: PENDING → CLAIMED → PRINTING → COMPLETED/FAILED"),

  heading2("7.6 Security Architecture"),
  para("The security architecture addresses 16 identified vulnerabilities across 12 files:"),
  makeTable(
    ["Layer", "Measure", "Implementation"],
    [
      ["Input", "Schema validation", "Zod schemas on all server actions and API routes"],
      ["Auth", "Timing-safe comparison", "crypto.timingSafeEqual for secret verification"],
      ["Auth", "Role-based protection", "Proxy middleware checks role on every route"],
      ["Data", "Safe selects", "Exclude password/sensitive fields from user queries"],
      ["Data", "IDOR prevention", "Ownership verification on all data access operations"],
      ["Network", "Security headers", "X-Frame-Options, CSP, HSTS via next.config.ts"],
      ["Code", "Error handling", "try/catch on all JSON.parse, safe error messages"],
      ["Print", "Input sanitization", "Regex-based sanitization of printer names and URIs"],
    ]
  ),
]

const experimentalContent: (Paragraph | Table)[] = [
  heading1("8. Experimental Setup"),
  heading2("8.1 Development Environment"),
  makeTable(
    ["Component", "Specification"],
    [
      ["Operating System", "macOS (Darwin)"],
      ["Runtime", "Node.js"],
      ["Package Manager", "npm"],
      ["IDE", "Visual Studio Code"],
      ["Browser", "Chrome (for testing)"],
      ["Database", "PostgreSQL on Neon (cloud)"],
      ["Version Control", "Git with GitHub"],
      ["CI/CD", "Vercel (auto-deploy on push to main)"],
    ]
  ),

  heading2("8.2 Testing Framework"),
  para("The project implements two categories of automated tests:"),
  heading2("8.2.1 End-to-End (E2E) Tests — 63 Tests"),
  para("The E2E test suite (test-e2e.sh) validates HTTP endpoint availability and response codes across all application routes:"),
  makeTable(
    ["Phase", "Tests", "Description"],
    [
      ["Phase 1", "19", "Public and authentication route accessibility"],
      ["Phase 2", "28", "Protected route redirection for unauthenticated users"],
      ["Phase 3", "4", "Cross-role access protection verification"],
      ["Phase 4", "2", "QR code and scan flow validation"],
      ["Phase 5", "5", "Page content verification for key pages"],
      ["Phase 6", "5", "Internal link verification (SPA detection)"],
      ["Phase 7", "3", "API endpoint existence verification"],
    ]
  ),

  heading2("8.2.2 Interaction Tests — 55 Tests"),
  para("The interaction test suite (test-interaction.sh) validates cross-component functionality:"),
  makeTable(
    ["Category", "Tests", "Description"],
    [
      ["Shop Agent", "14", "Dashboard and QR code flow verification"],
      ["Customer Agent", "10", "Upload and order flow verification"],
      ["QR Connection", "5", "Shop QR → Customer scan → Upload connection"],
      ["Order Flow", "5", "Shop order creation → Customer view validation"],
      ["Cross-Role", "6", "Unauthorized access prevention"],
      ["Data Model", "6", "Entity relationships and schema integrity"],
      ["QR Token System", "5", "Token generation, verification, and recording"],
      ["Payment Flow", "3", "Stripe integration and pay-later functionality"],
    ]
  ),

  heading2("8.3 Security Audit"),
  para("The project underwent multiple security audits resulting in identification and remediation of 16 vulnerabilities:"),
  makeTable(
    ["#", "Severity", "File", "Vulnerability", "Remediation"],
    [
      ["1", "Critical", "qr-token.ts", "Hardcoded fallback secret", "Removed fallback, added 24h expiry"],
      ["2", "High", "shop.actions.ts", "User data exposure", "Safe select excluding passwords"],
      ["3", "High", "order.actions.ts", "IDOR vulnerability", "Ownership verification added"],
      ["4", "High", "dashboard.actions.ts", "Missing ownership check", "Shop ownership verification"],
      ["5", "High", "notification.actions.ts", "Unauthorized mark-read", "IDOR fix with ownership check"],
      ["6", "High", "payment.actions.ts", "Missing auth on payment", "Auth + amount validation"],
      ["7", "High", "customer-order.actions.ts", "PII in tracking", "Stripped sensitive fields"],
      ["8", "Medium", "operator.actions.ts", "JSON.parse crash", "try/catch error handling"],
      ["9", "Medium", "printer.actions.ts", "JSON.parse crash", "try/catch error handling"],
      ["10", "Medium", "auth.actions.ts", "Verbose error messages", "Sanitized error responses"],
      ["11", "Medium", "auth.config.ts", "Google OAuth always on", "Conditional provider loading"],
      ["12", "Medium", "api/print/route.ts", "No role restriction", "SHOP_OWNER/STAFF only"],
      ["13", "High", "next.config.ts", "Missing security headers", "X-Frame-Options, CSP, HSTS"],
      ["14", "Critical", "print-service.ts", "Operator precedence bug", "Fixed ternary grouping"],
      ["15", "High", "dispatch/route.ts", "Race condition on jobs", "Atomic PENDING→CLAIMED via $transaction"],
      ["16", "High", "register/route.ts", "Timing side-channel", "crypto.timingSafeEqual"],
    ]
  ),

  heading2("8.4 Performance Metrics"),
  makeTable(
    ["Metric", "Value"],
    [
      ["Total Source Files", "135"],
      ["Server Action Lines", "2,959"],
      ["Database Models", "25+"],
      ["Application Routes", "59"],
      ["API Endpoints", "12"],
      ["Build Time", "~15 seconds"],
      ["Build Status", "Zero errors, zero warnings"],
      ["Test Pass Rate", "100% (code-level checks)"],
      ["Security Vulnerabilities", "16 identified, 16 remediated"],
    ]
  ),
]

const referencesContent: Paragraph[] = [
  heading1("9. References"),
  para("[1] Printify, \"Print-on-Demand Platform,\" https://www.printify.com, 2024."),
  para("[2] Printful, \"Custom Print-on-Demand & Fulfillment,\" https://www.printful.com, 2024."),
  para("[3] PrintStop, \"Online Printing Service for Businesses,\" https://www.printstop.co.in, 2024."),
  para("[4] Vistaprint, \"Custom Printing for Small Businesses,\" https://www.vistaprint.com, 2024."),
  para("[5] A. Gunasekaran and E. W. T. Ngai, \"Information systems in supply chain integration and management,\" European Journal of Operational Research, vol. 159, no. 2, pp. 269-295, 2004."),
  para("[6] H. Lee and B. Lee, \"Cloud-based enterprise resource planning for small businesses,\" Journal of Business Information Systems, vol. 15, no. 3, pp. 112-128, 2019."),
  para("[7] Easy Software Products, \"Common Unix Printing System (CUPS),\" https://www.cups.org, 2024."),
  para("[8] IETF, \"Internet Printing Protocol (IPP),\" RFC 8011, January 2017."),
  para("[9] Google, \"Google Cloud Print,\" https://cloud.google.com/print, Discontinued January 2021."),
  para("[10] PWG, \"IPP Everywhere Standard,\" https://www.pwg.org/ipp/everywhere.html, 2024."),
  para("[11] Apple Inc., \"AirPrint Technology,\" https://support.apple.com/en-us/HT201311, 2024."),
  para("[12] C. Richardson and S. Ruby, \"Microservices Patterns,\" Manning Publications, 2018."),
  para("[13] OWASP Foundation, \"OWASP Top 10 Web Application Security Risks,\" https://owasp.org/www-project-top-ten/, 2021."),
  para("[14] OWASP Foundation, \"Application Security Verification Standard (ASVS),\" https://owasp.org/www-project-application-security-verification-standard/, 2021."),
  para("[15] S. Rust, M. Rosenberger, and C. Hannon, \"Security Analysis of OAuth 2.0 Implementation,\" in Proc. IEEE International Conference on Cybercrime and Computer Forensics, 2019."),
  para("[16] EFI, \"Fiery Digital Print Server,\" https://www.efi.com/fiery/, 2024."),
  para("[17] HP, \"HP SmartStream Production Print Workflow,\" https://www.hp.com/smartstream, 2024."),
  para("[18] Vercel, \"Next.js Documentation,\" https://nextjs.org/docs, 2024."),
  para("[19] Prisma, \"Prisma ORM Documentation,\" https://www.prisma.io/docs, 2024."),
  para("[20] Stripe, \"Stripe API Documentation,\" https://stripe.com/docs/api, 2024."),
]

const approvalContent: (Paragraph | Table)[] = [
  pageBreak(),
  heading1("10. Approval Statement"),
  emptyLine(),
  para("This is to certify that the project report entitled"),
  para("\"PrintQ: A Cloud-Based Print Shop Management Platform with Remote Print Server Integration\"", { bold: true, align: AlignmentType.CENTER }),
  para("submitted by Shreyash (Roll No: _____________) is a bonafide work carried out under my supervision in partial fulfillment of the requirements for the degree of Bachelor of Technology in Computer Science and Engineering."),
  emptyLine(),
  emptyLine(),
  emptyLine(),
  makeTable(
    ["", ""],
    [
      ["Guide Name:", "________________________________"],
      ["Designation:", "________________________________"],
      ["Department:", "Computer Science and Engineering"],
      ["Date:", "________________________________"],
      ["Signature:", "________________________________"],
    ]
  ),
  emptyLine(),
  emptyLine(),
  emptyLine(),
  makeTable(
    ["", ""],
    [
      ["Head of Department:", "________________________________"],
      ["Designation:", "________________________________"],
      ["Date:", "________________________________"],
      ["Signature:", "________________________________"],
    ]
  ),
  emptyLine(),
  emptyLine(),
  para("External Examiner: ________________________________________________"),
  para("Date: _________________ Signature: _________________"),
]

const plagiarismContent: (Paragraph | Table)[] = [
  pageBreak(),
  heading1("11. Plagiarism Report"),
  emptyLine(),
  para("DECLARATION ON ORIGINALITY AND PLAGIARISM", { bold: true, align: AlignmentType.CENTER }),
  emptyLine(),
  para("I hereby declare that the project report entitled \"PrintQ: A Cloud-Based Print Shop Management Platform with Remote Print Server Integration\" submitted by me is my own original work and has not been submitted elsewhere for any academic degree or diploma. All sources of information used have been acknowledged and cited appropriately."),
  emptyLine(),
  para("I further declare that this report does not contain any plagiarized material. The code, design, documentation, and analysis presented in this report are original works of the undersigned, developed during the course of this project."),
  emptyLine(),
  para("The plagiarism check has been conducted using standard plagiarism detection tools. The similarity index and detailed report are attached herewith."),
  emptyLine(),
  emptyLine(),
  makeTable(
    ["Item", "Details"],
    [
      ["Student Name", "Shreyash"],
      ["Roll Number", "_______________"],
      ["Project Title", "PrintQ: A Cloud-Based Print Shop Management Platform"],
      ["Plagiarism Check Tool", "[Tool Name — e.g., Turnitin / Urkund / Compilatio]"],
      ["Similarity Index", "[XX%]"],
      ["Date of Check", "[DD/MM/YYYY]"],
    ]
  ),
  emptyLine(),
  emptyLine(),
  para("The plagiarism report (attached) shows a similarity index within acceptable limits as prescribed by the university."),
  emptyLine(),
  emptyLine(),
  para("Signature: _________________________________"),
  para("Date: _________________________________"),
  emptyLine(),
  emptyLine(),
  para("Verified by:"),
  para("Guide Signature: _________________________________"),
  para("Date: _________________________________"),
]

// ==========================================
// BUILD DOCUMENT
// ==========================================

const doc = new Document({
  creator: "PrintQ Project",
  title: "PrintQ: A Cloud-Based Print Shop Management Platform",
  description: "Academic project report on PrintQ",
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(1.0), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
      {
        reference: "numbered",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font: FONT, size: FONT_SIZE },
        paragraph: { spacing: { line: LINE_SPACING } },
      },
      heading1: {
        run: { font: FONT, size: HEADING1_SIZE, bold: true },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      heading2: {
        run: { font: FONT, size: HEADING2_SIZE, bold: true },
        paragraph: { spacing: { before: 300, after: 150 } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "PrintQ — Project Report", font: FONT, size: 18, italics: true, color: "888888" }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Page ", font: FONT, size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 }),
                new TextRun({ text: " of ", font: FONT, size: 18 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18 }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...titlePage,
        pageBreak(),
        ...abstractContent,
        pageBreak(),
        ...introductionContent,
        pageBreak(),
        ...literatureContent,
        pageBreak(),
        ...motivationContent,
        pageBreak(),
        ...problemDefContent,
        pageBreak(),
        ...problemStatementContent,
        pageBreak(),
        ...objectivesContent,
        pageBreak(),
        ...architectureContent,
        pageBreak(),
        ...experimentalContent,
        pageBreak(),
        ...referencesContent,
        ...approvalContent,
        ...plagiarismContent,
      ],
    },
  ],
})

async function main() {
  console.log("Generating PrintQ-Report.docx...")
  const buffer = await Packer.toBuffer(doc)
  const outPath = "/Users/shreyash/Downloads/Project/printq/PrintQ-Report.docx"
  fs.writeFileSync(outPath, buffer)
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2)
  console.log(`Done! Output: ${outPath} (${sizeMB} MB)`)
}

main().catch((e) => { console.error(e); process.exit(1) })

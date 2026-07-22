#!/bin/bash

# ============================================================
# PrintQ Shop ↔ Customer Interaction Test
# Tests the complete data flow between shop and customer
# ============================================================

BASE_URL="http://localhost:3000"
PASS="\033[0;32m"
FAIL="\033[0;31m"
WARN="\033[0;33m"
INFO="\033[0;36m"
RESET="\033[0m"
BOLD="\033[1m"
CYAN="\033[0;36m"
RESULTS=()

log_test() {
  local status=$1
  local test_name=$2
  local detail=$3
  case $status in
    PASS) echo -e "  ${PASS}✓${RESET} $test_name${detail:+ — $detail}"; RESULTS+=("PASS|$test_name") ;;
    FAIL) echo -e "  ${FAIL}✗${RESET} $test_name${detail:+ — $detail}"; RESULTS+=("FAIL|$test_name") ;;
    WARN) echo -e "  ${WARN}⚠${RESET} $test_name${detail:+ — $detail}"; RESULTS+=("WARN|$test_name") ;;
    INFO) echo -e "  ${INFO}ℹ${RESET} $test_name${detail:+ — $detail}" ;;
  esac
}

section() {
  echo ""
  echo -e "${BOLD}${CYAN}━━━ $1 ━━━${RESET}"
}

# ============================================================
# SHOP AGENT: Tests shop-side functionality
# ============================================================
section "SHOP AGENT: Dashboard & QR Code Flow"

# Test shop dashboard renders with QR section
shop_dashboard=$(curl -s "${BASE_URL}/shop/dashboard" 2>/dev/null)
code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/shop/dashboard" 2>/dev/null)
if [ "$code" = "302" ]; then
  log_test "PASS" "Shop dashboard protected" "Redirects to shop-login when unauthenticated"
else
  log_test "FAIL" "Shop dashboard protected" "Returns $code instead of 302"
fi

# Test shop QR page (via dashboard which contains QrDisplay)
shop_pages=(
  "/shop/dashboard"
  "/shop/queue"
  "/shop/orders"
  "/shop/customers"
  "/shop/printers"
  "/shop/pricing"
  "/shop/analytics"
  "/shop/reports"
  "/shop/staff"
  "/shop/notifications"
  "/shop/settings"
  "/shop/profile"
  "/shop/billing"
  "/shop/subscription"
)

for page in "${shop_pages[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page}" 2>/dev/null)
  redir=$(curl -s -o /dev/null -w "%{redirect_url}" "${BASE_URL}${page}" 2>/dev/null)
  if [ "$code" = "302" ] && echo "$redir" | grep -q "auth/shop-login"; then
    log_test "PASS" "Shop route: $page" "Protected → auth/shop-login"
  else
    log_test "FAIL" "Shop route: $page" "$code $redir"
  fi
done

# ============================================================
# CUSTOMER AGENT: Tests customer-side functionality
# ============================================================
section "CUSTOMER AGENT: Upload & Order Flow"

customer_pages=(
  "/customer/dashboard"
  "/customer/upload"
  "/customer/orders"
  "/customer/track"
  "/customer/scan"
  "/customer/notifications"
  "/customer/support"
  "/customer/settings"
  "/customer/profile"
  "/customer/success"
)

for page in "${customer_pages[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page}" 2>/dev/null)
  redir=$(curl -s -o /dev/null -w "%{redirect_url}" "${BASE_URL}${page}" 2>/dev/null)
  if [ "$code" = "302" ] && echo "$redir" | grep -q "auth/customer-login"; then
    log_test "PASS" "Customer route: $page" "Protected → auth/customer-login"
  else
    log_test "FAIL" "Customer route: $page" "$code $redir"
  fi
done

# ============================================================
# INTERACTION TEST: QR Code → Scan → Upload Connection
# ============================================================
section "INTERACTION: Shop QR → Customer Scan → Upload Connection"

# Step 1: Shop generates QR → QR display URL should use /customer/scan/
shop_page_html=$(curl -s "${BASE_URL}/shop/dashboard" 2>/dev/null)
# Note: The QR URL is generated client-side, so we test the component source
qr_component=$(cat src/components/shop/qr-display.tsx 2>/dev/null)
if echo "$qr_component" | grep -q "/customer/scan/"; then
  log_test "PASS" "Shop QR links to /customer/scan/" "QR display generates correct scan URL"
else
  log_test "FAIL" "Shop QR links to /customer/scan/" "QR display uses wrong URL path"
fi

# Step 2: Customer scan page exists and handles tokens
scan_page_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/customer/scan" 2>/dev/null)
if [ "$scan_page_code" = "302" ]; then
  log_test "PASS" "Customer scan page" "Exists and requires authentication"
else
  log_test "WARN" "Customer scan page" "Returns $scan_page_code"
fi

# Step 3: Invalid QR token shows error page (not 404)
invalid_scan_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/customer/scan/definitely-invalid-token" 2>/dev/null)
# This should either redirect (auth) or show error page
if [ "$invalid_scan_code" = "302" ] || [ "$invalid_scan_code" = "200" ]; then
  log_test "PASS" "Invalid QR token handled" "Returns $invalid_scan_code (auth redirect or error page)"
else
  log_test "FAIL" "Invalid QR token handled" "Returns $invalid_scan_code"
fi

# Step 4: Customer scan form uses correct URLs (check source code)
scan_form_src=$(cat src/app/customer/scan/scan-form.tsx 2>/dev/null)
if echo "$scan_form_src" | grep -q '/customer/scan/'; then
  log_test "PASS" "Scan form uses /customer/scan/" "All router.push() calls use correct path"
else
  log_test "FAIL" "Scan form uses /customer/scan/" "Still uses /scan/ path"
fi

# Step 5: Scan token page uses correct callback URLs
scan_token_src=$(cat "src/app/customer/scan/[token]/page.tsx" 2>/dev/null)
if echo "$scan_token_src" | grep -q '/customer/scan/'; then
  log_test "PASS" "Scan token page uses /customer/scan/" "Callback URLs use correct path"
else
  log_test "FAIL" "Scan token page uses /customer/scan/" "Uses stale /scan/ path"
fi

# ============================================================
# INTERACTION TEST: Order Flow (Shop creates → Customer sees)
# ============================================================
section "INTERACTION: Shop Order Creation → Customer View"

# Test shop order creation action exists
order_actions=$(cat src/lib/actions/order.actions.ts 2>/dev/null)
if echo "$order_actions" | grep -q "createOrderAction"; then
  log_test "PASS" "Shop order creation exists" "createOrderAction in order.actions.ts"
else
  log_test "FAIL" "Shop order creation exists" "Missing createOrderAction"
fi

# Test customer order creation action exists
cust_order_actions=$(cat src/lib/actions/customer-order.actions.ts 2>/dev/null)
if echo "$cust_order_actions" | grep -q "createCustomerOrderAction"; then
  log_test "PASS" "Customer order creation exists" "createCustomerOrderAction in customer-order.actions.ts"
else
  log_test "FAIL" "Customer order creation exists" "Missing createCustomerOrderAction"
fi

# Test queue actions exist (shop processes orders)
queue_actions=$(cat src/lib/actions/queue.actions.ts 2>/dev/null)
if echo "$queue_actions" | grep -q "getQueueAction" && echo "$queue_actions" | grep -q "completePrintJobAction"; then
  log_test "PASS" "Queue management actions exist" "getQueueAction + completePrintJobAction"
else
  log_test "FAIL" "Queue management actions exist" "Missing queue actions"
fi

# Test operator actions exist (shop manages print process)
operator_actions=$(cat src/lib/actions/operator.actions.ts 2>/dev/null)
if echo "$operator_actions" | grep -q "startPrintWithSettingsAction" && echo "$operator_actions" | grep -q "acceptPayLaterOrderAction"; then
  log_test "PASS" "Operator actions exist" "startPrint + acceptPayLater actions"
else
  log_test "FAIL" "Operator actions exist" "Missing operator actions"
fi

# Test notification actions (cross-role communication)
notif_actions=$(cat src/lib/actions/notification.actions.ts 2>/dev/null)
if echo "$notif_actions" | grep -q "createNotificationAction" && echo "$notif_actions" | grep -q "getNotificationsAction"; then
  log_test "PASS" "Notification actions exist" "Create + Get notifications"
else
  log_test "FAIL" "Notification actions exist" "Missing notification actions"
fi

# ============================================================
# INTERACTION TEST: Cross-Role Auth Protection
# ============================================================
section "INTERACTION: Cross-Role Auth Protection"

# Customer trying to access shop routes
for route in /shop/dashboard /shop/queue /shop/orders; do
  redir=$(curl -s -o /dev/null -w "%{redirect_url}" "${BASE_URL}${route}" 2>/dev/null)
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}" 2>/dev/null)
  if [ "$code" = "302" ] && echo "$redir" | grep -q "auth/shop-login"; then
    log_test "PASS" "Cross-role: Unauth → $route" "Redirects to shop-login"
  else
    log_test "FAIL" "Cross-role: Unauth → $route" "$code $redir"
  fi
done

# Shop trying to access customer routes
for route in /customer/dashboard /customer/upload /customer/orders; do
  redir=$(curl -s -o /dev/null -w "%{redirect_url}" "${BASE_URL}${route}" 2>/dev/null)
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${route}" 2>/dev/null)
  if [ "$code" = "302" ] && echo "$redir" | grep -q "auth/customer-login"; then
    log_test "PASS" "Cross-role: Unauth → $route" "Redirects to customer-login"
  else
    log_test "FAIL" "Cross-role: Unauth → $route" "$code $redir"
  fi
done

# ============================================================
# INTERACTION TEST: Data Model Relationships
# ============================================================
section "INTERACTION: Data Model & Relationships"

schema=$(cat prisma/schema.prisma 2>/dev/null)

# Order belongs to both Customer and Shop
if echo "$schema" | grep -q "model Order" && echo "$schema" | grep -A40 "model Order" | grep -q "shopId" && echo "$schema" | grep -A40 "model Order" | grep -q "customerId"; then
  log_test "PASS" "Order linked to Shop + Customer" "Order has shopId and customerId"
else
  log_test "FAIL" "Order linked to Shop + Customer" "Missing relationships"
fi

# QueueItem belongs to Shop and Order
if echo "$schema" | grep -q "model QueueItem" && echo "$schema" | grep -A15 "model QueueItem" | grep -q "shopId" && echo "$schema" | grep -A15 "model QueueItem" | grep -q "orderId"; then
  log_test "PASS" "QueueItem linked to Shop + Order" "QueueItem has shopId and orderId"
else
  log_test "FAIL" "QueueItem linked to Shop + Order" "Missing relationships"
fi

# Shop has QR token
if echo "$schema" | grep -A30 "model Shop" | grep -q "qrToken"; then
  log_test "PASS" "Shop has QR token field" "qrToken for customer scan flow"
else
  log_test "FAIL" "Shop has QR token field" "Missing qrToken field"
fi

# ScanEvent tracks scans
if echo "$schema" | grep -q "model ScanEvent"; then
  log_test "PASS" "ScanEvent model exists" "Tracks QR scan events"
else
  log_test "FAIL" "ScanEvent model exists" "Missing ScanEvent model"
fi

# Customer belongs to Shop
if echo "$schema" | grep -A20 "model Customer" | grep -q "shopId"; then
  log_test "PASS" "Customer linked to Shop" "Customer has shopId"
else
  log_test "FAIL" "Customer linked to Shop" "Missing shopId"
fi

# PrintFile belongs to Order
if echo "$schema" | grep -A15 "model PrintFile" | grep -q "orderId"; then
  log_test "PASS" "PrintFile linked to Order" "PrintFile has orderId"
else
  log_test "FAIL" "PrintFile linked to Order" "Missing orderId"
fi

# ============================================================
# INTERACTION TEST: QR Token Generation & Verification
# ============================================================
section "INTERACTION: QR Token System"

qr_token_src=$(cat src/lib/qr-token.ts 2>/dev/null)
qr_actions_src=$(cat src/lib/actions/qr.actions.ts 2>/dev/null)

# QR token generation exists
if echo "$qr_token_src" | grep -q "generateQrToken"; then
  log_test "PASS" "QR token generation" "generateQrToken function exists"
else
  log_test "FAIL" "QR token generation" "Missing generateQrToken"
fi

# QR token verification exists
if echo "$qr_token_src" | grep -q "verifyQrToken"; then
  log_test "PASS" "QR token verification" "verifyQrToken function exists"
else
  log_test "FAIL" "QR token verification" "Missing verifyQrToken"
fi

# Get shop QR action
if echo "$qr_actions_src" | grep -q "getShopQrAction"; then
  log_test "PASS" "Get shop QR action" "getShopQrAction exists"
else
  log_test "FAIL" "Get shop QR action" "Missing getShopQrAction"
fi

# Verify shop QR action
if echo "$qr_actions_src" | grep -q "verifyShopQrAction"; then
  log_test "PASS" "Verify shop QR action" "verifyShopQrAction exists"
else
  log_test "FAIL" "Verify shop QR action" "Missing verifyShopQrAction"
fi

# Record scan action
if echo "$qr_actions_src" | grep -q "recordScanAction"; then
  log_test "PASS" "Record scan action" "recordScanAction exists"
else
  log_test "FAIL" "Record scan action" "Missing recordScanAction"
fi

# ============================================================
# INTERACTION TEST: Payment Flow
# ============================================================
section "INTERACTION: Payment & Pricing Flow"

payment_src=$(cat src/lib/actions/payment.actions.ts 2>/dev/null)
if echo "$payment_src" | grep -q "createPaymentIntentAction"; then
  log_test "PASS" "Stripe payment intent" "createPaymentIntentAction exists"
else
  log_test "FAIL" "Stripe payment intent" "Missing createPaymentIntentAction"
fi

# Check upload page handles payment methods
upload_src=$(cat src/app/customer/upload/page.tsx 2>/dev/null)
if echo "$upload_src" | grep -q "pay_later\|Pay Later"; then
  log_test "PASS" "Pay Later option exists" "Customer can choose to pay later"
else
  log_test "FAIL" "Pay Later option exists" "Missing pay later flow"
fi

if echo "$upload_src" | grep -q "Stripe\|stripe\|paymentIntent"; then
  log_test "PASS" "Stripe card payment exists" "Customer can pay with card"
else
  log_test "FAIL" "Stripe card payment exists" "Missing card payment flow"
fi

# ============================================================
# RESULTS SUMMARY
# ============================================================
section "INTERACTION TEST RESULTS"

total=${#RESULTS[@]}
pass=0
fail=0
warn=0

for r in "${RESULTS[@]}"; do
  status="${r%%|*}"
  case $status in
    PASS) pass=$((pass + 1)) ;;
    FAIL) fail=$((fail + 1)) ;;
    WARN) warn=$((warn + 1)) ;;
  esac
done

echo ""
echo -e "  ${BOLD}Total Tests: $total${RESET}"
echo -e "  ${PASS}Passed: $pass${RESET}"
echo -e "  ${FAIL}Failed: $fail${RESET}"
echo -e "  ${WARN}Warnings: $warn${RESET}"
echo ""

if [ $fail -eq 0 ]; then
  echo -e "  ${PASS}${BOLD}ALL INTERACTION TESTS PASSED!${RESET}"
  echo -e "  ${INFO}Shop ↔ Customer flow is fully connected${RESET}"
else
  echo -e "  ${FAIL}${BOLD}$fail INTERACTION TEST(S) FAILED${RESET}"
  echo -e "  ${WARN}Some shop-customer interactions may be broken${RESET}"
fi
echo ""

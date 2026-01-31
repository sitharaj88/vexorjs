#!/bin/bash
set -e

echo "=========================================="
echo "   Vexor Enterprise Verification Suite   "
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0

check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
  fi
}

# 1. Build packages
echo -e "${YELLOW}Step 1: Building packages...${NC}"
npm run build > /dev/null 2>&1
check "Packages build successfully"

# 2. Check package exports
echo ""
echo -e "${YELLOW}Step 2: Checking package exports...${NC}"
node -e "require.resolve('@vexorjs/core')" > /dev/null 2>&1
check "@vexorjs/core exports correctly"

node -e "require.resolve('@vexorjs/orm')" > /dev/null 2>&1
check "@vexorjs/orm exports correctly"

node -e "require.resolve('@vexorjs/cli')" > /dev/null 2>&1
check "@vexorjs/cli exports correctly"

# 3. Test basic-api example
echo ""
echo -e "${YELLOW}Step 3: Testing basic-api example...${NC}"
cd examples/basic-api

# Start server in background
npx tsx index.ts > /tmp/basic-api.log 2>&1 &
PID=$!
sleep 3

# Test health endpoint
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null || echo "failed")
if echo "$HEALTH" | grep -q "healthy"; then
  check "basic-api health check"
else
  echo -e "${RED}✗${NC} basic-api health check"
  ((FAILED++))
fi

# Test users endpoint
USERS=$(curl -s http://localhost:3000/users 2>/dev/null || echo "failed")
if echo "$USERS" | grep -q "users"; then
  check "basic-api users endpoint"
else
  echo -e "${RED}✗${NC} basic-api users endpoint"
  ((FAILED++))
fi

kill $PID 2>/dev/null || true
cd ../..

# 4. Test enterprise-api example
echo ""
echo -e "${YELLOW}Step 4: Testing enterprise-api example...${NC}"
cd examples/enterprise-api

# Install dependencies
npm install > /dev/null 2>&1
check "enterprise-api dependencies installed"

# Run migrations
npx tsx src/db/migrate.ts > /dev/null 2>&1
check "enterprise-api migrations run"

# Seed database
npx tsx src/db/seed.ts > /dev/null 2>&1
check "enterprise-api database seeded"

# Start server
npx tsx src/index.ts > /tmp/enterprise-api.log 2>&1 &
PID=$!
sleep 3

# Test health endpoint
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null || echo "failed")
if echo "$HEALTH" | grep -q "healthy"; then
  check "enterprise-api health check"
else
  echo -e "${RED}✗${NC} enterprise-api health check"
  ((FAILED++))
fi

# Test login
LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' 2>/dev/null || echo "failed")
if echo "$LOGIN" | grep -q "accessToken"; then
  check "enterprise-api login works"
else
  echo -e "${RED}✗${NC} enterprise-api login works"
  ((FAILED++))
fi

# Extract token
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Test authenticated endpoint
ME=$(curl -s http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "failed")
if echo "$ME" | grep -q "admin@example.com"; then
  check "enterprise-api auth/me works"
else
  echo -e "${RED}✗${NC} enterprise-api auth/me works"
  ((FAILED++))
fi

# Test products endpoint
PRODUCTS=$(curl -s http://localhost:3000/products 2>/dev/null || echo "failed")
if echo "$PRODUCTS" | grep -q "data"; then
  check "enterprise-api products list"
else
  echo -e "${RED}✗${NC} enterprise-api products list"
  ((FAILED++))
fi

# Test CORS headers
CORS=$(curl -s -I -X OPTIONS http://localhost:3000/products \
  -H "Origin: http://example.com" 2>/dev/null | grep -i "access-control" || echo "")
if [ -n "$CORS" ]; then
  check "CORS headers present"
else
  echo -e "${RED}✗${NC} CORS headers present"
  ((FAILED++))
fi

# Test rate limit headers
RATE=$(curl -s -I http://localhost:3000/health 2>/dev/null | grep -i "x-ratelimit" || echo "")
if [ -n "$RATE" ]; then
  check "Rate limit headers present"
else
  echo -e "${RED}✗${NC} Rate limit headers present"
  ((FAILED++))
fi

kill $PID 2>/dev/null || true

# 5. Run unit tests
echo ""
echo -e "${YELLOW}Step 5: Running enterprise-api tests...${NC}"
npm test > /tmp/test-output.log 2>&1
if [ $? -eq 0 ]; then
  check "All enterprise-api tests pass"
else
  echo -e "${RED}✗${NC} enterprise-api tests"
  ((FAILED++))
  echo "Test output:"
  cat /tmp/test-output.log
fi

cd ../..

# Clean up
rm -f examples/enterprise-api/data/enterprise.db

# Summary
echo ""
echo "=========================================="
echo "               Summary                    "
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All verifications passed!${NC}"
  exit 0
else
  echo -e "${RED}Some verifications failed.${NC}"
  exit 1
fi

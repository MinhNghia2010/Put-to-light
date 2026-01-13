/**
 * Test Script for Put-to-Light API
 * 
 * This script tests all the workflow scenarios:
 * 1. Valid basket processing
 * 2. Capacity checking
 * 3. Idempotency (duplicate prevention)
 * 4. Invalid QR data handling
 * 5. Unknown product handling
 * 
 * Run: node scripts/test-put-to-light.js
 */

const BASE_URL = "http://localhost:3000/api/put-to-light";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log("\n" + "=".repeat(60));
  log(`TEST: ${name}`, "cyan");
  console.log("=".repeat(60));
}

function logResult(success, message) {
  if (success) {
    log(`✅ PASS: ${message}`, "green");
  } else {
    log(`❌ FAIL: ${message}`, "red");
  }
}

async function makeRequest(method, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(BASE_URL, options);
  const data = await response.json();
  return { status: response.status, data };
}

// =============================================================================
// TEST CASES
// =============================================================================

async function testValidBasket() {
  logTest("Valid Basket Processing");
  
  const basket = {
    basketId: "b-test-001",
    items: [
      { sku: "apple-red", qty: 5 },
      { sku: "milk-carton", qty: 2 }
    ]
  };
  
  console.log("Input:", JSON.stringify(basket, null, 2));
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = data.success && 
    data.data?.basketId === "b-test-001" &&
    data.data?.totalItems === 7 &&
    data.data?.assignedCrate?.crateId;
    
  logResult(success, "Valid basket should be assigned to a crate");
  return success;
}

async function testDuplicateBasket() {
  logTest("Duplicate Basket Prevention (Idempotency)");
  
  const basket = {
    basketId: "b-test-001", // Same as previous test
    items: [
      { sku: "apple-red", qty: 5 },
      { sku: "milk-carton", qty: 2 }
    ]
  };
  
  console.log("Input: Same basket ID as before");
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = !data.success && 
    data.error?.code === "ALREADY_PROCESSED" &&
    status === 409;
    
  logResult(success, "Duplicate basket should be rejected with ALREADY_PROCESSED error");
  return success;
}

async function testInvalidQRMissingBasketId() {
  logTest("Invalid QR - Missing Basket ID");
  
  const basket = {
    items: [{ sku: "apple-red", qty: 5 }]
  };
  
  console.log("Input:", JSON.stringify(basket, null, 2));
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = !data.success && data.error?.code === "MISSING_BASKET_ID";
  logResult(success, "Missing basketId should return MISSING_BASKET_ID error");
  return success;
}

async function testInvalidQREmptyItems() {
  logTest("Invalid QR - Empty Items Array");
  
  const basket = {
    basketId: "b-test-empty",
    items: []
  };
  
  console.log("Input:", JSON.stringify(basket, null, 2));
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = !data.success && data.error?.code === "MISSING_ITEMS";
  logResult(success, "Empty items array should return MISSING_ITEMS error");
  return success;
}

async function testInvalidQRBadQuantity() {
  logTest("Invalid QR - Invalid Quantity");
  
  const basket = {
    basketId: "b-test-badqty",
    items: [
      { sku: "apple-red", qty: -5 }  // Negative quantity
    ]
  };
  
  console.log("Input:", JSON.stringify(basket, null, 2));
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = !data.success && data.error?.code === "INVALID_QR_DATA";
  logResult(success, "Invalid quantity should return INVALID_QR_DATA error");
  return success;
}

async function testUnknownProduct() {
  logTest("Unknown Product");
  
  const basket = {
    basketId: "b-test-unknown",
    items: [
      { sku: "apple-red", qty: 2 },
      { sku: "mystery-product-xyz", qty: 1 }  // Not in registry
    ]
  };
  
  console.log("Input:", JSON.stringify(basket, null, 2));
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = !data.success && 
    data.error?.code === "UNKNOWN_PRODUCT" &&
    data.error?.details?.unknownSkus?.includes("mystery-product-xyz");
    
  logResult(success, "Unknown product should return UNKNOWN_PRODUCT error with SKU list");
  return success;
}

async function testCapacityCheck() {
  logTest("Capacity Check - Large Basket");
  
  // This basket requires 100 items - should still find a crate with capacity
  const basket = {
    basketId: "b-test-large",
    items: [
      { sku: "apple-red", qty: 30 },
      { sku: "milk-carton", qty: 20 }
    ]
  };
  
  console.log("Input:", JSON.stringify(basket, null, 2));
  
  const { status, data } = await makeRequest("POST", basket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  // Should succeed because CRATE-B1-01 has capacity 50 with 0 load
  const success = data.success && data.data?.totalItems === 50;
  logResult(success, "Large basket should find suitable crate");
  return success;
}

async function testGetStatus() {
  logTest("Get Crate Status");
  
  const { status, data } = await makeRequest("GET");
  
  console.log("Response Status:", status);
  console.log("Summary:", JSON.stringify(data.summary, null, 2));
  console.log("Crates (sample):", JSON.stringify(data.crates?.slice(0, 3), null, 2));
  
  const success = data.success && 
    data.summary?.totalCrates > 0 &&
    data.crates?.length > 0;
    
  logResult(success, "Should return crate status summary");
  return success;
}

async function testReset() {
  logTest("Reset All Crates");
  
  const { status, data } = await makeRequest("DELETE");
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = data.success;
  logResult(success, "Should reset all crates");
  return success;
}

async function testNoCapacity() {
  logTest("No Capacity Available");
  
  // First, fill up crates with multiple large baskets
  const largeBaskets = [
    { basketId: "fill-1", items: [{ sku: "apple-red", qty: 20 }] },
    { basketId: "fill-2", items: [{ sku: "apple-red", qty: 20 }] },
    { basketId: "fill-3", items: [{ sku: "apple-red", qty: 15 }] },
    { basketId: "fill-4", items: [{ sku: "apple-red", qty: 18 }] },
    { basketId: "fill-5", items: [{ sku: "apple-red", qty: 30 }] },
    { basketId: "fill-6", items: [{ sku: "apple-red", qty: 30 }] },
    { basketId: "fill-7", items: [{ sku: "apple-red", qty: 50 }] },
    { basketId: "fill-8", items: [{ sku: "apple-red", qty: 50 }] },
  ];
  
  console.log("Filling up crates...");
  for (const basket of largeBaskets) {
    await makeRequest("POST", basket);
  }
  
  // Now try to add a basket that won't fit
  const overflowBasket = {
    basketId: "overflow-basket",
    items: [{ sku: "apple-red", qty: 100 }]  // Way too many items
  };
  
  console.log("Input:", JSON.stringify(overflowBasket, null, 2));
  
  const { status, data } = await makeRequest("POST", overflowBasket);
  
  console.log("Response Status:", status);
  console.log("Response:", JSON.stringify(data, null, 2));
  
  const success = !data.success && 
    data.error?.code === "NO_CAPACITY" &&
    status === 503;
    
  logResult(success, "Should return NO_CAPACITY when all crates are full");
  return success;
}

async function testMalformedJSON() {
  logTest("Malformed JSON");
  
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json here",
    });
    const data = await response.json();
    
    console.log("Response Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    const success = !data.success && data.error?.code === "INVALID_QR_DATA";
    logResult(success, "Malformed JSON should return INVALID_QR_DATA error");
    return success;
  } catch (error) {
    log(`Error: ${error.message}`, "red");
    return false;
  }
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

async function runTests() {
  console.log("\n");
  log("╔══════════════════════════════════════════════════════════════╗", "yellow");
  log("║         PUT-TO-LIGHT API TEST SUITE                          ║", "yellow");
  log("╚══════════════════════════════════════════════════════════════╝", "yellow");
  
  const results = [];
  
  try {
    // Reset before tests
    log("\n📋 Resetting state before tests...", "blue");
    await makeRequest("DELETE");
    
    // Run all tests
    results.push({ name: "Valid Basket", pass: await testValidBasket() });
    results.push({ name: "Duplicate Prevention", pass: await testDuplicateBasket() });
    results.push({ name: "Missing Basket ID", pass: await testInvalidQRMissingBasketId() });
    results.push({ name: "Empty Items", pass: await testInvalidQREmptyItems() });
    results.push({ name: "Invalid Quantity", pass: await testInvalidQRBadQuantity() });
    results.push({ name: "Unknown Product", pass: await testUnknownProduct() });
    results.push({ name: "Capacity Check", pass: await testCapacityCheck() });
    results.push({ name: "Get Status", pass: await testGetStatus() });
    
    // Reset and test no capacity
    await makeRequest("DELETE");
    results.push({ name: "No Capacity", pass: await testNoCapacity() });
    
    results.push({ name: "Malformed JSON", pass: await testMalformedJSON() });
    
    // Final cleanup
    await makeRequest("DELETE");
    
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, "red");
    console.error(error);
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  log("TEST SUMMARY", "yellow");
  console.log("=".repeat(60));
  
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  
  results.forEach(r => {
    const icon = r.pass ? "✅" : "❌";
    const color = r.pass ? "green" : "red";
    log(`  ${icon} ${r.name}`, color);
  });
  
  console.log("-".repeat(60));
  log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`, 
      failed === 0 ? "green" : "red");
  
  if (failed === 0) {
    log("\n🎉 All tests passed! The Put-to-Light API is working correctly.", "green");
  } else {
    log("\n⚠️ Some tests failed. Please review the output above.", "red");
  }
}

// Run tests
runTests().catch(console.error);


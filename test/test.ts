import { createQuery } from "../src/ssoql";

// Sample data
const testData = {
  users: [
    { id: 1, name: "Alice", age: 30, active: true },
    { id: 2, name: "Bob", age: 25, active: false },
    { id: 3, name: "Charlie", age: 35, active: true },
  ],
  departments: [
    { id: 101, name: "Engineering", manager: 1 },
    { id: 102, name: "Marketing", manager: 3 },
  ],
};

// Test query creation
const query = createQuery("USE users WHERE age > 28");
console.log("Expected objects:", query.expectedObjects());

// Check if expected objects include 'users'
const expectedObjects = query.expectedObjects();
if (expectedObjects.includes("users")) {
  console.log(
    '✓ Test passed: Query correctly identifies "users" as an expected object',
  );
} else {
  console.log(
    '✗ Test failed: Query should identify "users" as an expected object',
  );
}

// Try executing the query
try {
  const results = query.execute(testData);
  console.log("Query execution results:", results);
  console.log("✓ Test passed: Query executed successfully");
} catch (error) {
  console.error("✗ Test failed: Error executing query:", error);
}

// Test with invalid object
try {
  const invalidQuery = createQuery("USE nonexistent");
  console.log(
    "Expected objects for invalid query:",
    invalidQuery.expectedObjects(),
  );

  // This should throw an error since 'nonexistent' is not in testData
  invalidQuery.execute(testData);
  console.log("✗ Test failed: Should have thrown an error for missing object");
} catch (error) {
  console.log("✓ Test passed: Correctly threw error for missing object");
}

console.log("All tests completed!");

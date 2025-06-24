/**
 * Core features tests for SSOQL
 * This file tests the basic functionality of the SSOQL language
 */

const assert = require("assert");
const ssoql = require("../dist/ssoql").default;


// Simple test data structure with various types of data
const testData = {
  products: [
    {
      id: 1,
      name: "Laptop",
      category: "Electronics",
      price: 1200,
      inStock: true,
      tags: ["tech", "premium"],
    },
    {
      id: 2,
      name: "Phone",
      category: "Electronics",
      price: 800,
      inStock: true,
      tags: ["tech", "mobile"],
    },
    {
      id: 3,
      name: "Headphones",
      category: "Electronics",
      price: 200,
      inStock: false,
      tags: ["tech", "audio"],
    },
    {
      id: 4,
      name: "Desk",
      category: "Furniture",
      price: 350,
      inStock: true,
      tags: ["home", "office"],
    },
    {
      id: 5,
      name: "Chair",
      category: "Furniture",
      price: 150,
      inStock: true,
      tags: ["home", "office"],
    },
    {
      id: 6,
      name: "Lamp",
      category: "Furniture",
      price: 50,
      inStock: false,
      tags: ["home", "lighting"],
    },
    {
      id: 7,
      name: "T-shirt",
      category: "Clothing",
      price: 25,
      inStock: true,
      tags: ["casual", "cotton"],
    },
    {
      id: 8,
      name: "Jeans",
      category: "Clothing",
      price: 60,
      inStock: true,
      tags: ["casual", "denim"],
    },
  ],
  users: [
    { id: 1, name: "Alice", age: 28, active: true },
    { id: 2, name: "Bob", age: 34, active: true },
    { id: 3, name: "Charlie", age: 42, active: false },
    { id: 4, name: "Diana", age: 31, active: true },
  ],
  stores: {
    main: {
      location: "Downtown",
      inventory: [1, 2, 3, 5, 7, 8],
      employees: 12,
    },
    branch: {
      location: "Suburb",
      inventory: [1, 4, 5, 6],
      employees: 8,
    },
  },
};

// Test suite for core SSOQL features
describe("SSOQL Core Features", function () {
  // Test basic SELECT queries
  describe("Basic SELECT", function () {
    it("should find user id", function () {
      const query = `
        USE users

        QUERY userIds
        SELECT id
        SUM
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);

      assert.strictEqual(result.userIds, 10);
    });

    it("should select a single field", function () {
      const query = `
        USE stores.main

        QUERY mainLocation
        SELECT location
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.mainLocation, "Downtown");
    });

    it("should select from different use possibilities", function () {
      const query = `
        USE stores.[main, branch]

        QUERY locations
        SELECT location
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      console.log(result)
      assert.strictEqual(result.locations, {main: "Downtown", branch: "Suburb"});

    });
  });

  // Test WHERE conditions
  describe("WHERE Conditions", function () {
    it("should filter with equality condition", function () {
      const query = `
        USE products

        QUERY electronicProducts
        SELECT id WHERE (category = "Electronics")
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.electronics.length, 3);
    });

    it("should filter with CONTAINS condition", function () {
      const query = `
        USE products

        QUERY techProducts
        SELECT id WHERE (tags CONTAINS "tech")
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.techProducts.length, 3);
    });

    it("should combine conditions with AND", function () {
      const query = `
        USE products

        QUERY inStockElectronics
        SELECT id WHERE (category = "Electronics" & inStock = true)
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      
      assert.strictEqual(result.inStockElectronics, [1,2]);
    });
  });

  // Test COUNT operation
  describe("COUNT Operation", function () {
    it("should count all items", function () {
      const query = `
        USE products

        QUERY productCount
        COUNT SELECT id
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.productCount, 8);
    });

    it("should count filtered items", function () {
      const query = `
        USE products

        QUERY inStockCount
        COUNT SELECT id WHERE (inStock = true)
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.inStockCount, 6);
    });
  });

  // Test SUM operation
  describe("SUM Operation", function () {
    it("should sum selected values", function () {
      const query = `
        USE products

        QUERY totalPrice
        SELECT price
        SUM
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.totalPrice, 2835); // Sum of all prices
    });

    it("should sum filtered values", function () {
      const query = `
        USE products

        QUERY electronicsTotal
        SELECT price WHERE (category = "Electronics")
        SUM
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.electronicsTotal, 2200); // 1200 + 800 + 200
    });
  });

  // Test DIVIDE operation
  describe("DIVIDE Operation", function () {
    it("should divide two values", function () {
      const query = `
        USE products

        QUERY averagePrice
        SELECT price
        $totalPrice SUM
        $productCount COUNT SELECT id
        DIVIDE $totalPrice $productCount
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.averagePrice, 354.375); // 2835 / 8
    });
  });

  // Test PERCENT_OF operation
  describe("PERCENT_OF Operation", function () {
    it("should calculate percentage with two SELECT statements", function () {
      const query = `
        USE products

        QUERY inStockPercent
        PERCENT_OF SELECT id WHERE (inStock = true), SELECT id
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.inStockPercent, 75); // 6 out of 8 products (75%)
    });

    it("should calculate percentage with specific categories", function () {
      const query = `
        USE products

        QUERY electronicsPercent
        PERCENT_OF SELECT id WHERE (category = "Electronics"), SELECT id
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.electronicsPercent, 37.5); // 3 out of 8 products (37.5%)
    });
  });

  // Test MOST_FREQUENT operation
  describe("MOST_FREQUENT Operation", function () {
    it("should find the most frequent category", function () {
      const query = `
        USE products

        QUERY topCategory
        SELECT category
        $mostCommon MOST_FREQUENT
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      // There are 3 Electronics, 3 Furniture, 2 Clothing
      assert.ok(
        result.topCategory === "Electronics" ||
          result.topCategory === "Furniture",
      );
    });
  });

  // Test multiple query blocks
  describe("Multiple Query Blocks", function () {
    it("should process multiple query blocks", function () {
      const query = `
        USE products

        QUERY totalCount
        COUNT SELECT id
        RETURN

        QUERY electronicsCount
        COUNT SELECT * WHERE (category = "Electronics")
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.strictEqual(result.totalCount, 8);
      assert.strictEqual(result.electronicsCount, 3);
    });
  });

  // Test USE statements with array notation
  describe("USE with Array Notation", function () {
    it("should select specific fields using array notation", function () {
      const query = `
        USE products.[name, price, category]

        QUERY simpleProducts
        COUNT SELECT name
        RETURN
      `;

      const result = ssoql.createQuery(query).execute(testData);
      assert.ok(result.simpleProducts);
      if (result.simpleProducts.length > 0) {
        assert.ok("name" in result.simpleProducts[0]);
        assert.ok("price" in result.simpleProducts[0]);
        assert.ok("category" in result.simpleProducts[0]);
      }
    });
  });

  // Test expected objects
  describe("Expected Objects", function () {
    it("should correctly identify expected objects", function () {
      const query = `
        USE products
        USE users
        USE locations

        QUERY dummy
        COUNT SELECT id
        RETURN
      `;

      const expectedObjects = ssoql.createQuery(query).expectedObjects();
      console.log(expectedObjects)
      assert.ok(expectedObjects.includes("products"));
      assert.ok(expectedObjects.includes("users"));
    });
  });
});

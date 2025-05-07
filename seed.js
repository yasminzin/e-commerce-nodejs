const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const bcryptjs = require("bcryptjs");
const User = require("./models/users");
const Brand = require("./models/brands");
const Category = require("./models/categories");
const Product = require("./models/products");
const Cart = require("./models/cart");
const Order = require("./models/orders");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI; // Load from .env

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Helper function to generate a valid password
const generatePassword = () => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$#%&*_-";
  let password = letters[Math.floor(Math.random() * letters.length)]; // Start with a letter
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

// Helper function to generate a valid username
const generateUsername = () => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let username = letters[Math.floor(Math.random() * letters.length)]; // Start with a letter
  for (let i = 0; i < 7; i++) {
    username += chars[Math.floor(Math.random() * chars.length)];
  }
  return username;
};

// Helper function to generate a valid email
const generateEmail = () => {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphanum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const domains = "abcdefghijklmnopqrstuvwxyz";
  const tlds = ["com", "org", "net", "info", "co"];
  
  // Username: starts with letter, 3-10 alphanumeric chars
  let username = letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < faker.number.int({ min: 2, max: 9 }); i++) {
    username += alphanum[Math.floor(Math.random() * alphanum.length)];
  }
  
  // Domain: 2-10 letters
  let domain = "";
  const domainLength = faker.number.int({ min: 2, max: 10 });
  for (let i = 0; i < domainLength; i++) {
    domain += domains[Math.floor(Math.random() * domains.length)];
  }
  
  // TLD: 2-5 letters
  const tld = tlds[faker.number.int({ min: 0, max: tlds.length - 1 })];
  
  return `${username}@${domain}.${tld}`;
};

// Helper function to generate a valid phone number
const generatePhoneNumber = () => {
  const length = faker.number.int({ min: 10, max: 15 });
  let number = "";
  for (let i = 0; i < length; i++) {
    number += faker.number.int({ min: 0, max: 9 }).toString();
  }
  return number;
};

// Clear database and drop incorrect indexes
const clearDB = async () => {
  try {
    // Drop incorrect 'userame_1' index if it exists
    try {
      await User.collection.dropIndex("userame_1");
      console.log("Dropped incorrect 'userame_1' index");
    } catch (error) {
      if (error.codeName !== "IndexNotFound") {
        console.error("Error dropping 'userame_1' index:", error);
      }
    }

    await User.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log("Cleared existing data");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  const users = [];
  const roles = ["user", "seller", "admin"];
  for (let i = 0; i < 10; i++) {
    const password = generatePassword();
    const userData = {
      firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, "").slice(0, 15),
      lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, "").slice(0, 15),
      username: generateUsername(),
      email: generateEmail(),
      password, // Store plain password; pre-save hook will hash it
      birthDate: faker.date.between({ from: "1950-01-01", to: "2015-01-01" }),
      phoneNumbers: [
        {
          type: faker.helpers.arrayElement(["home", "work", "mobile"]),
          number: generatePhoneNumber(),
        },
      ],
      address: {
        street: faker.location.streetAddress(),
        flatnumber: faker.number.int({ min: 1, max: 100 }).toString(),
        city: faker.location.city(),
        country: faker.location.country(),
      },
      role: roles[i % roles.length],
    };

    if (!userData.username) {
      console.warn(`Skipping user ${i + 1}: username is null`);
      continue;
    }

    console.log(`Generated user: ${userData.username}, email: ${userData.email}, password: ${userData.password}, phone: ${userData.phoneNumbers[0].number}`);
    try {
      const user = new User(userData);
      users.push(await user.save());
    } catch (error) {
      if (error.code === 11000) {
        console.warn(`Duplicate username "${userData.username}" or email "${userData.email}" skipped`);
        continue;
      }
      throw error;
    }
  }
  console.log(`Seeded ${users.length} users`);
  return users;
};

// Seed brands
const seedBrands = async (sellerUsers) => {
  const brands = [];
  for (let i = 0; i < 5; i++) {
    const brand = new Brand({
      name: faker.company.name().replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20).trim(),
      logo: faker.image.url(),
      userId: sellerUsers[i % sellerUsers.length]._id,
      categories: [],
    });
    brands.push(await brand.save());
  }
  console.log("Seeded 5 brands");
  return brands;
};

// Seed categories
const seedCategories = async (sellerUsers, brands) => {
  const categories = [];
  // Predefined list of unique category names
  const uniqueCategoryNames = [
    "Electronics",
    "Fashion",
    "Home",
    "Beauty",
    "Sports",
  ];
  
  for (let i = 0; i < 5; i++) {
    const categoryName = uniqueCategoryNames[i];
    console.log(`Generated category: ${categoryName}`);
    try {
      const category = new Category({
        name: categoryName.slice(0, 20).trim(),
        image: faker.image.url(),
        userId: sellerUsers[i % sellerUsers.length]._id,
        brands: [brands[i % brands.length]._id],
      });
      categories.push(await category.save());
    } catch (error) {
      if (error.code === 11000) {
        console.warn(`Duplicate category name "${categoryName}" skipped`);
        continue;
      }
      throw error;
    }
  }
  console.log(`Seeded ${categories.length} categories`);
  return categories;
};

// Seed products
const seedProducts = async (sellerUsers, categories, brands) => {
  const products = [];
  for (let i = 0; i < 20; i++) {
    const price = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
    const appliedDiscount = faker.number.int({ min: 0, max: 50 });
    const priceAfterDiscount = price - (price * appliedDiscount) / 100;
    const product = new Product({
      title: faker.commerce.productName().slice(0, 50).trim(),
      description: faker.lorem.sentence().trim(),
      images: [faker.image.url(), faker.image.url()],
      userId: sellerUsers[i % sellerUsers.length]._id,
      categoryId: categories[i % categories.length]._id,
      brandId: brands[i % brands.length]._id,
      price,
      stock: faker.number.int({ min: 0, max: 100 }),
      appliedDiscount,
      priceAfterDiscount,
      avgRating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
    });
    products.push(await product.save());
  }
  console.log("Seeded 20 products");
  return products;
};

// Seed carts
const seedCarts = async (regularUsers, products) => {
  const carts = [];
  for (let i = 0; i < regularUsers.length; i++) {
    const cartProducts = [
      {
        productId: products[i % products.length]._id,
        quantity: faker.number.int({ min: 1, max: 5 }),
      },
      {
        productId: products[(i + 1) % products.length]._id,
        quantity: faker.number.int({ min: 1, max: 5 }),
      },
    ];
    const cart = new Cart({
      products: cartProducts,
      userId: regularUsers[i]._id,
      totalPrice: 0, // Will be calculated in pre-save hook
    });
    carts.push(await cart.save());
  }
  console.log("Seeded carts for users");
  return carts;
};

// Seed orders
const seedOrders = async (regularUsers, products) => {
  for (let i = 0; i < regularUsers.length; i++) {
    const orderProducts = [
      {
        product: products[i % products.length]._id,
        quantity: faker.number.int({ min: 1, max: 5 }),
      },
    ];
    const totalPrice = orderProducts.reduce((sum, item) => {
      const product = products.find((p) => p._id.equals(item.product));
      return sum + (product.priceAfterDiscount || product.price) * item.quantity;
    }, 0);
    const paymentMethod = faker.helpers.arrayElement(["cod", "online"]);
    const orderData = {
      user: regularUsers[i]._id,
      products: orderProducts,
      totalPrice,
      paymentMethod,
      status: faker.helpers.arrayElement(["pending", "completed", "cancelled"]),
    };

    // Add address for COD orders
    if (paymentMethod === "cod") {
      orderData.address = {
        street: faker.location.streetAddress(),
        flatnumber: faker.number.int({ min: 1, max: 100 }).toString(),
      };
    }

    const order = new Order(orderData);
    await order.save();
  }
  console.log("Seeded orders for users");
};

// Main seeding function
const seedAll = async () => {
  try {
    await clearDB();
    const users = await seedUsers();
    const sellerUsers = users.filter((u) => u.role === "seller");
    const regularUsers = users.filter((u) => u.role === "user");
    const brands = await seedBrands(sellerUsers);
    const categories = await seedCategories(sellerUsers, brands);

    // Update brands with categories
    for (let i = 0; i < brands.length; i++) {
      brands[i].categories = [categories[i % categories.length]._id];
      await brands[i].save();
    }

    const products = await seedProducts(sellerUsers, categories, brands);
    await seedCarts(regularUsers, products);
    await seedOrders(regularUsers, products);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
seedAll();
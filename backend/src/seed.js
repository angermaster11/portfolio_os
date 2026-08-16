/**
 * Seed script — creates the admin user "anger" if not exists.
 * 
 * Usage: node src/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

const ADMIN_USERNAME = "anger";
const ADMIN_PASSWORD = "anger@admin";

const seed = async () => {
    try {
        await connectDB();

        const existing = await User.findOne({ username: ADMIN_USERNAME });

        if (existing) {
            console.log(`User "${ADMIN_USERNAME}" already exists. Skipping.`);
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

            await User.create({
                username: ADMIN_USERNAME,
                password: hashedPassword
            });

            console.log(`Admin user "${ADMIN_USERNAME}" created successfully.`);
            console.log(`Default password: ${ADMIN_PASSWORD}`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
};

seed();

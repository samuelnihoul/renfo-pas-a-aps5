#!/usr/bin/env node

/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <password> <name>
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database connection (you'll need to adjust this based on your setup)
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/renfo_pas_a_pas',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdminUser(email, password, name) {
    try {
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log('User already exists. Updating to admin...');

            // Update existing user to admin
            await pool.query(
                'UPDATE users SET "isAdmin" = true WHERE email = $1',
                [email]
            );

            console.log(`✅ User ${email} has been granted admin privileges!`);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new admin user
        const result = await pool.query(
            `INSERT INTO users (id, email, name, password_hash, "isAdmin", "isPremium", "emailVerified", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, email, name, "isAdmin"`,
            [uuidv4(), email, hashedPassword, name, true, false, new Date()]
        );

        console.log('✅ Admin user created successfully!');
        console.log('User details:', result.rows[0]);

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Get command line arguments
const [, , email, password, name] = process.argv;

if (!email || !password || !name) {
    console.log('Usage: node scripts/create-admin.js <email> <password> <name>');
    console.log('Example: node scripts/create-admin.js admin@example.com password123 "Admin User"');
    process.exit(1);
}

createAdminUser(email, password, name);

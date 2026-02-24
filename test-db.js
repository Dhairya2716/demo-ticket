const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

async function testConnection() {
    try {
        console.log('Attempting to connect with:', {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USERNAME,
            database: process.env.DATABASE_NAME,
        });
        await client.connect();
        console.log('Connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Query successful:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed details:');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('Detail:', err.detail);
        process.exit(1);
    }
}

testConnection();

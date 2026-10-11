const mongoose = require('mongoose');
const { cleanupOrphanedConnections } = require('./cleanupOrphanedConnections');
require('dotenv').config();

async function runCleanup() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECTION_SECRET);
        console.log('✅ Connected to MongoDB');
        
        // Run cleanup
        const deletedCount = await cleanupOrphanedConnections();
        
        console.log(`\n🎉 Cleanup completed! Deleted ${deletedCount} orphaned connection requests.`);
        
        // Disconnect
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        
        process.exit(0);
    } catch(err) {
        console.error('❌ Cleanup failed:', err);
        process.exit(1);
    }
}

runCleanup();

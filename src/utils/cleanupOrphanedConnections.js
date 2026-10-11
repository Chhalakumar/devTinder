const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

async function cleanupOrphanedConnections() {
    try {
        console.log('Starting cleanup of orphaned connection requests...');
        
        const allRequests = await ConnectionRequest.find({});
        let deletedCount = 0;
        
        for(let request of allRequests) {
            const fromUserExists = await User.findById(request.fromUserId);
            const toUserExists = await User.findById(request.toUserId);
            
            if(!fromUserExists || !toUserExists) {
                await ConnectionRequest.deleteOne({_id: request._id});
                deletedCount++;
                console.log(`Deleted orphaned request: ${request._id}`);
            }
        }
        
        console.log(`✅ Cleaned up ${deletedCount} orphaned connection requests`);
        return deletedCount;
    } catch(err) {
        console.error('❌ Error during cleanup:', err.message);
        throw err;
    }
}

module.exports = { cleanupOrphanedConnections };

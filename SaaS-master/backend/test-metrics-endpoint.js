/**
 * Test the LinkedIn metrics endpoint
 */

import axios from 'axios';

const userEmail = 'contact.pawsomeai@gmail.com';

console.log('🧪 Testing LinkedIn Metrics Endpoint\n');
console.log('='.repeat(70));

async function testEndpoint() {
    try {
        console.log(`\n📊 Fetching metrics for: ${userEmail}\n`);

        const response = await axios.get(`http://localhost:3010/api/linkedin/metrics`, {
            params: {
                email: userEmail
            }
        });

        console.log('✅ Response received:\n');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('\n' + '='.repeat(70));
            console.log('\n✅ SUCCESS! Metrics fetched successfully');
            console.log(`\n📊 Company: ${response.data.companyName}`);
            console.log(`   Posts: ${response.data.posts.total}`);
            console.log(`   Likes: ${response.data.engagementScore.likes}`);
            console.log(`   Comments: ${response.data.engagementScore.comments}`);
            console.log(`   Shares: ${response.data.engagementScore.shares}`);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testEndpoint();

// test-linkedin.js - Test LinkedIn Scraper Service
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';        
import fs from 'fs';

// Initialize the Apify client with your API token
const client = new ApifyClient({
    token: process.env.APIFY_API_KEY,
});

async function scrapeLinkedInPosts() {
    try {
        console.log('🔍 Starting LinkedIn scraper...');
        
        // Prepare Actor input - SCRAPING 20 POSTS
        const input = {
            targetUrls: [
                'https://www.linkedin.com/company/incresco-technology',
                // Add more company URLs here
            ],
            maxPosts: 20, // Scrape 20 posts per company
            scrapeReactions: false, // Set to true if you want reactions (costs extra)
            scrapeComments: false, // Set to true if you want comments (costs extra)
            maxReactions: 0, // 0 = all reactions (if enabled)
            maxComments: 0, // 0 = all comments (if enabled)
            includeReposts: true, // Include reposted content
            includeQuotePosts: true, // Include quote posts
        };

        // Run the Actor and wait for it to finish
        console.log('🚀 Running actor harvestapi/linkedin-profile-posts...');
        const run = await client.actor('harvestapi/linkedin-profile-posts').call(input);

        console.log(`✅ Actor run finished. Status: ${run.status}`);
        console.log(`📦 Dataset ID: ${run.defaultDatasetId}`);

        // Fetch results from the Actor's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`\n📄 Scraped ${items.length} total items`);
        
        // Filter posts only
        const posts = items.filter(item => item.type === 'post');
        console.log(`📝 Found ${posts.length} posts\n`);
        
        // Process and display results
        console.log('='.repeat(80));
        console.log('📊 SCRAPED DATA SUMMARY');
        console.log('='.repeat(80) + '\n');
        
        posts.forEach((item, index) => {
            console.log(`Post ${index + 1}:`);
            console.log(`  👤 Company: ${item.author?.name || 'Unknown'}`);
            console.log(`  👥 Followers: ${item.author?.info || 'N/A'}`);
            console.log(`  📅 Posted: ${item.postedAt?.postedAgoText || 'Unknown'}`);
            console.log(`  👍 Likes: ${item.engagement?.likes || 0}`);
            console.log(`  💬 Comments: ${item.engagement?.comments || 0}`);
            console.log(`  🔄 Shares: ${item.engagement?.shares || 0}`);
            console.log(`  📝 Content: ${(item.content || '').substring(0, 100)}...`);
            console.log(`  🔗 URL: ${item.linkedinUrl}\n`);
        });

        // Save to JSON file
        fs.writeFileSync('linkedin-posts.json', JSON.stringify(items, null, 2));
        console.log('💾 Data saved to linkedin-posts.json\n');

        // Calculate analytics
        const totalEngagement = posts.reduce((sum, post) => {
            const likes = post.engagement?.likes || 0;
            const comments = post.engagement?.comments || 0;
            const shares = post.engagement?.shares || 0;
            return sum + likes + comments + shares;
        }, 0);
        const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;

        const totalLikes = posts.reduce((sum, post) => sum + (post.engagement?.likes || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (post.engagement?.comments || 0), 0);
        const totalShares = posts.reduce((sum, post) => sum + (post.engagement?.shares || 0), 0);

        console.log('='.repeat(80));
        console.log('📈 ANALYTICS');
        console.log('='.repeat(80));
        console.log(`Total Posts Scraped: ${posts.length}`);
        console.log(`Total Likes: ${totalLikes}`);
        console.log(`Total Comments: ${totalComments}`);
        console.log(`Total Shares: ${totalShares}`);
        console.log(`Total Engagement: ${totalEngagement}`);
        console.log(`Avg Engagement per Post: ${avgEngagement.toFixed(1)}`);
        
        // Get company info from first post
        if (posts.length > 0 && posts[0].author) {
            console.log(`\nCompany Name: ${posts[0].author.name}`);
            console.log(`Company Followers: ${posts[0].author.info}`);
        }
        
        console.log('='.repeat(80) + '\n');

        return items;

    } catch (error) {
        console.error('❌ Error running actor:', error.message);
        throw error;
    }
}

// Run the scraper
scrapeLinkedInPosts()
    .then(() => {
        console.log('✅ Scraping completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Scraping failed:', error);
        process.exit(1);
    });

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to exchange LinkedIn authorization code for access token
 * and fetch organization metrics using Community Management API
 * 
 * Usage: node test-linkedin.js
 */

// LinkedIn OAuth Configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '86x2hsbgbwfqsd';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3002/auth/linkedin/callback';

// Authorization code from the callback URL
// Authorization code from the callback URL
const AUTHORIZATION_CODE = 'AQSmbcTIrjOcTX4Y0TddBbqxO7x9ryDO84cV1CgIcS0BGEN1AG4ibp_cLuDuAsL1YSJzcJU-DFoNbAZgKF9UzupEjfd1V6fq6R2Uf1scVjKgHgeUggr0nybQXwNsguwkUzErVXkX3yV6PFGw1xgkt5XV964eft3I20_y80JNBr5Xi4XqcV1S73wozBhxGSvBKHbjxw4tkTiS3zunwFA';


// LinkedIn API Configuration
const LINKEDIN_API_BASE = 'https://api.linkedin.com/rest';
const API_VERSION = '202410';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

/**
 * Step 1: Exchange authorization code for access token
 */
async function exchangeCodeForToken() {
    console.log('\n' + colors.blue + '📤 Step 1: Exchanging authorization code for access token...' + colors.reset);

    try {
        const response = await axios.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: AUTHORIZATION_CODE,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, expires_in, scope } = response.data;

        console.log(colors.green + '✅ Access token obtained successfully!' + colors.reset);
        console.log('📊 Token details:');
        console.log(`   - Expires in: ${expires_in} seconds (${(expires_in / 86400).toFixed(1)} days)`);
        console.log(`   - Scopes granted: ${scope}`);
        console.log(`   - Access token: ${access_token.substring(0, 30)}...`);

        return access_token;

    } catch (error) {
        console.error(colors.red + '❌ Error exchanging code for token:' + colors.reset);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Step 2: Get user's organizations
 */
async function getUserOrganizations(accessToken) {
    console.log('\n' + colors.blue + '🏢 Step 2: Fetching user organizations...' + colors.reset);

    try {
        const response = await axios.get(`${LINKEDIN_API_BASE}/organizationAcls`, {
            params: {
                q: 'roleAssignee',
                projection: '(elements*(organizationalTarget~,roleAssignee,state))'
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'LinkedIn-Version': API_VERSION,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        const organizations = response.data.elements || [];

        console.log(colors.green + `✅ Found ${organizations.length} organization(s)` + colors.reset);

        organizations.forEach((org, index) => {
            const orgData = org['organizationalTarget~'];
            console.log(`\n   ${index + 1}. ${orgData?.localizedName || 'Unknown'}`);
            console.log(`      - ID: ${org.organizationalTarget.split(':').pop()}`);
            console.log(`      - Role: ${org.roleAssignee?.role || 'N/A'}`);
            console.log(`      - State: ${org.state}`);
        });

        return organizations;

    } catch (error) {
        console.error(colors.red + '❌ Error fetching organizations:' + colors.reset);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Step 3: Get organization posts
 */
async function getOrganizationPosts(accessToken, organizationId) {
    console.log('\n' + colors.blue + `📝 Step 3: Fetching posts for organization: ${organizationId}` + colors.reset);

    try {
        const response = await axios.get(`${LINKEDIN_API_BASE}/posts`, {
            params: {
                author: `urn:li:organization:${organizationId}`,
                q: 'author',
                count: 10,
                sortBy: 'LAST_MODIFIED'
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'LinkedIn-Version': API_VERSION,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        const posts = response.data.elements || [];

        console.log(colors.green + `✅ Found ${posts.length} post(s)` + colors.reset);

        posts.forEach((post, index) => {
            const createdDate = new Date(post.createdAt).toLocaleDateString();
            console.log(`\n   ${index + 1}. Post created: ${createdDate}`);
            console.log(`      - URN: ${post.id}`);
            console.log(`      - Commentary: ${post.commentary?.substring(0, 50) || '(No text)'}...`);
            console.log(`      - State: ${post.lifecycleState}`);
        });

        return posts;

    } catch (error) {
        console.error(colors.red + '❌ Error fetching posts:' + colors.reset);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Step 4: Get post statistics
 */
async function getPostStatistics(accessToken, postUrn) {
    try {
        const encodedUrn = encodeURIComponent(postUrn);
        const response = await axios.get(`${LINKEDIN_API_BASE}/socialMetadata/${encodedUrn}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'LinkedIn-Version': API_VERSION,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        const data = response.data;
        return {
            likes: data.likesSummary?.totalLikes || 0,
            comments: data.commentsSummary?.totalComments || 0,
            shares: data.sharesSummary?.totalShares || 0,
            engagement: data.totalEngagement || 0
        };

    } catch (error) {
        // Some posts might not have stats available
        return { likes: 0, comments: 0, shares: 0, engagement: 0 };
    }
}

/**
 * Step 5: Get follower statistics
 */
async function getFollowerStatistics(accessToken, organizationId) {
    console.log('\n' + colors.blue + `👥 Step 5: Fetching follower statistics...` + colors.reset);

    try {
        const response = await axios.get(`${LINKEDIN_API_BASE}/networkSizes/urn:li:organization:${organizationId}`, {
            params: {
                edgeType: 'CompanyFollowedByMember'
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'LinkedIn-Version': API_VERSION,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        const followerCount = response.data.firstDegreeSize || 0;

        console.log(colors.green + `✅ Total followers: ${followerCount}` + colors.reset);

        return followerCount;

    } catch (error) {
        console.warn(colors.yellow + '⚠️  Could not fetch follower statistics' + colors.reset);
        return 0;
    }
}

/**
 * Step 6: Get comprehensive metrics
 */
async function getComprehensiveMetrics(accessToken, organizationId, posts) {
    console.log('\n' + colors.blue + '📊 Step 6: Calculating comprehensive metrics...' + colors.reset);

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const postsWithStats = [];

    for (const post of posts) {
        const stats = await getPostStatistics(accessToken, post.id);

        totalLikes += stats.likes;
        totalComments += stats.comments;
        totalShares += stats.shares;

        postsWithStats.push({
            id: post.id,
            message: post.commentary?.substring(0, 60) || '(No message)',
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            totalEngagement: stats.likes + stats.comments + stats.shares
        });
    }

    // Sort by engagement
    postsWithStats.sort((a, b) => b.totalEngagement - a.totalEngagement);

    console.log(colors.green + '✅ Metrics calculated!' + colors.reset);
    console.log('\n📈 Engagement Summary:');
    console.log(`   - Total Likes: ${totalLikes}`);
    console.log(`   - Total Comments: ${totalComments}`);
    console.log(`   - Total Shares: ${totalShares}`);
    console.log(`   - Total Engagement: ${totalLikes + totalComments + totalShares}`);

    if (postsWithStats.length > 0) {
        console.log('\n🏆 Top 5 Performing Posts:');
        postsWithStats.slice(0, 5).forEach((post, index) => {
            console.log(`\n   ${index + 1}. "${post.message}..."`);
            console.log(`      - Likes: ${post.likes} | Comments: ${post.comments} | Shares: ${post.shares}`);
            console.log(`      - Total Engagement: ${post.totalEngagement}`);
        });
    }

    return {
        totalLikes,
        totalComments,
        totalShares,
        totalEngagement: totalLikes + totalComments + totalShares,
        topPosts: postsWithStats.slice(0, 5)
    };
}

/**
 * Main function to run all tests
 */
async function main() {
    console.log(colors.blue + '\n🚀 LinkedIn Community Management API Test Script' + colors.reset);
    console.log('='.repeat(60));

    try {
        // Step 1: Get access token
        const accessToken = await exchangeCodeForToken();

        // Step 2: Get organizations
        const organizations = await getUserOrganizations(accessToken);

        if (organizations.length === 0) {
            console.log(colors.yellow + '\n⚠️  No organizations found. Make sure you have admin access to a LinkedIn organization page.' + colors.reset);
            return;
        }

        // Use first organization
        const firstOrg = organizations[0];
        const orgId = firstOrg.organizationalTarget.split(':').pop();
        const orgName = firstOrg['organizationalTarget~']?.localizedName;

        console.log(colors.blue + `\n📍 Using organization: ${orgName} (ID: ${orgId})` + colors.reset);

        // Step 3: Get posts
        const posts = await getOrganizationPosts(accessToken, orgId);

        // Step 4 & 5: Get follower stats
        const followers = await getFollowerStatistics(accessToken, orgId);

        // Step 6: Get comprehensive metrics
        if (posts.length > 0) {
            const metrics = await getComprehensiveMetrics(accessToken, orgId, posts);

            // Calculate engagement rate
            if (followers > 0) {
                const engagementRate = ((metrics.totalEngagement / followers) * 100).toFixed(2);
                console.log(`\n💯 Engagement Rate: ${engagementRate}%`);
            }
        } else {
            console.log(colors.yellow + '\n⚠️  No posts found for this organization' + colors.reset);
        }

        console.log(colors.green + '\n✅ Test completed successfully!' + colors.reset);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error(colors.red + '\n❌ Test failed!' + colors.reset);
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the test
main();

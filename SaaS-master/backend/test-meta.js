import axios from 'axios';

const SEARCH_API_KEY = process.env.SEARCHAPI_KEY || 'wij3b8snhVpNb5eHfz8yhQvS';
const SEARCH_API_URL = 'https://www.searchapi.io/api/v1/search';

// Get page_id from username
async function getPageIdByUsername(username) {
  const params = {
    engine: 'meta_ad_library_page_search',
    q: username,
    api_key: SEARCH_API_KEY,
  };
  const response = await axios.get(SEARCH_API_URL, { params });
  const pageResults = response.data.page_results;
  if (pageResults && pageResults.length > 0) {
    return pageResults[0].page_id;
  }
  throw new Error('Page not found');
}

// Get ads for the page_id
async function getAdsByPageId(pageId) {
  const params = {
    engine: 'meta_ad_library',
    page_id: pageId,
    api_key: SEARCH_API_KEY,
  };
  const response = await axios.get(SEARCH_API_URL, { params });
  return response.data.ads || [];
}

// Get detailed ad info by ad_archive_id
async function getAdDetails(adArchiveId) {
  const params = {
    engine: 'meta_ad_library_ad_details',
    ad_archive_id: adArchiveId,
    api_key: SEARCH_API_KEY,
  };
  const response = await axios.get(SEARCH_API_URL, { params });
  return response.data;
}

// Main test function
async function testMetaAdsForUsername(username) {
  try {
    console.log(`Fetching page ID for username: ${username}`);
    const pageId = await getPageIdByUsername(username);
    console.log(`Page ID found: ${pageId}`);

    console.log(`Fetching ads for page ID: ${pageId}`);
    const ads = await getAdsByPageId(pageId);
    console.log(`Total ads found: ${ads.length}`);

    for (let i = 0; i < Math.min(3, ads.length); i++) {
      const ad = ads[i];
      console.log(`Fetching details for ad ID: ${ad.ad_archive_id}`);
      const details = await getAdDetails(ad.ad_archive_id);
      console.log(`Ad Details for ${ad.ad_archive_id}:`, JSON.stringify(details, null, 2));
    }
  } catch (error) {
    console.error('Error during Meta ad monitoring test:', error.message || error);
  }
}

// Run the test with username 'pesuniversity'
testMetaAdsForUsername('pesuniversity');

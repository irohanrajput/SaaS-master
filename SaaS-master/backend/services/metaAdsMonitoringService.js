// Meta Ads Monitoring Service
// Fetches Meta (Facebook/Instagram) ad library data from SearchAPI.io for a given query


import axios from 'axios';

const SEARCH_API_KEY = process.env.SEARCHAPI_KEY;
const SEARCH_API_URL = 'https://www.searchapi.io/api/v1/search';


const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'facebook-pages-scraper2.p.rapidapi.com';
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;


/**
 * Fetch Facebook Page ID from username using RapidAPI
 * @param {string} username - Facebook page username
 * @returns {Promise<string|null>} - Page ID or null if not found
 * Official Meta Ad Library Page Search API docs: https://www.searchapi.io/docs/meta-ad-library-page-search-api
 */
async function getPageIdFromUsername(username) {
  try {
    console.log(`[MetaAds] Username received for Page ID lookup:`, username);
    const pageUrl = `https://www.facebook.com/${username}`;
    const url = `${RAPIDAPI_BASE_URL}/get_facebook_pages_details`;
    const options = {
      method: 'GET',
      url,
      params: {
        link: pageUrl,
        show_verified_badge: 'false'
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    };
    console.log(`[MetaAds] Querying RapidAPI for Page ID with URL:`, pageUrl);
    const response = await axios.request(options);
    const data = response.data[0];
    console.log(`[MetaAds] RapidAPI response for Page ID:`, data);
    if (data && data.user_id) {
      console.log(`[MetaAds] Found Facebook Page ID:`, data.user_id);
      return data.user_id;
    }
    console.warn(`[MetaAds] No Page ID found for username:`, username);
    return null;
  } catch (error) {
    console.error('[MetaAds] Error fetching Facebook page ID:', error?.response?.data || error);
    return null;
  }
}


/**
 * Fetches Meta Ad Library data for a Facebook page username (two-step: get page ID, then ads)
 * @param {string} username - Facebook page username
 * @returns {Promise<Object>} - Parsed meta ads monitoring metrics
 * Official Meta Ad Library Ad Details API docs: https://www.searchapi.io/docs/meta-ad-library-ad-details-api
 */
export async function getMetaAdsMonitoring(username) {
  try {
    console.log(`[MetaAds] getMetaAdsMonitoring called with username:`, username);
    // Step 1: Get Facebook page ID from username
    const pageId = await getPageIdFromUsername(username);
    if (!pageId) {
      console.warn(`[MetaAds] Could not resolve Facebook page ID for username:`, username);
      return { error: 'Could not resolve Facebook page ID for username.' };
    }

    // Step 2: Fetch Meta Ad Library data using page ID
    const params = {
      engine: 'meta_ad_library',
      page_id: pageId,
      api_key: SEARCH_API_KEY
    };
    console.log(`[MetaAds] Querying SearchAPI.io for ads with page_id:`, pageId);
    const response = await axios.get(SEARCH_API_URL, { params });
    const data = response.data;
    console.log(`[MetaAds] SearchAPI.io response for ads:`, data);
    return {
      totalAds: data.search_information?.total_results || 0,
      adSamples: (Array.isArray(data.ads) ? data.ads : []).slice(0, 3).map(ad => ({
        id: ad.ad_archive_id,
        pageName: ad.snapshot?.page_name,
        pageProfile: ad.snapshot?.page_profile_uri,
        text: ad.snapshot?.body?.text,
        images: Array.isArray(ad.snapshot?.images) ? ad.snapshot.images.map(img => img.resized_image_url || img.original_image_url).filter(Boolean) : [],
        cta: ad.snapshot?.cta_text,
        startDate: ad.start_date,
        endDate: ad.end_date,
        isActive: ad.is_active
      }))
    };
  } catch (error) {
    console.error('[MetaAds] Meta Ads Monitoring Error:', error?.response?.data || error);
    return { error: 'Failed to fetch Meta Ads monitoring data.' };
  }
}

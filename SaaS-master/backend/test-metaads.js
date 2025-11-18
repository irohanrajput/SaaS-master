// test.js
import fetch from "node-fetch";

// Replace with your actual values
const APP_ID = "1146428707594901";
const APP_SECRET = "e89f1c731dee52e2314d142838ab6629";
const ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;

// PES University ad search
const SEARCH_TERM = "PES University";

const API_URL = "https://graph.facebook.com/v19.0/ads_archive";

const params = new URLSearchParams({
  search_terms: SEARCH_TERM,
  ad_reached_countries: "['IN']",
  fields:
    "ad_creation_time,ad_creative_body,ad_creative_link_title,page_name,ad_snapshot_url",
  access_token: "1146428707594901|c-muPatAJ6awrh05-Y4T_3LJ8mw",
});

(async () => {
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();

    console.log("✅ Ad Library Results:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);
  }
})();

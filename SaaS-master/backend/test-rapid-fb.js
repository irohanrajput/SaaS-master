const url = 'https://facebook-pages-scraper2.p.rapidapi.com/get_facebook_pages_details?link=https%3A%2F%2Fwww.facebook.com%2FEngenSA&show_verified_badge=false';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': 'beb04a38acmsh6d3e993c54c2d4fp1a525fjsnecb3ffee9285',
		'x-rapidapi-host': 'facebook-pages-scraper2.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
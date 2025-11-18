import axios from 'axios';

const ACCESS_TOKEN = 'AQUBcwh5dOhQgH1LHUuTvKDijP9eiDrgAVSbMtkXGIRdXeWNiJXsPsiLc8J_oio9QmH1IG_nsTRe6aE43_E2ppiTDqJBKnr6wE5vM12ySdvhcdqPEjS6hOQKCNRK74F5vRnpQsZ54DClT61Hn_4PMXi_Hzok1CmouPm3mdb33AFdg2Bq235mHyjZWTeqx1kpHvFAVdq3DVBYfWYofWg2wHD-5tMYyEIQetsG5E7x7gApkKtV5lvsxxSXidDtYz8zmEBPkbQQwRDN0fQdTy1YFS5uaIDXMu7Xs7n1dDCkDnsXTzaPZBPxhGZRo_7KdbrrxLdQbwpWLr2m9xxm2ZDeouUcA06x9w';
const ORG_URN = 'urn:li:organization:108126466';

console.log('🔍 LinkedIn Cumulative Follower Growth Analysis\n');
console.log('='.repeat(60));

/**
 * Get Cumulative Follower Count Over Time
 * Builds a historical timeline showing total followers each day
 */
async function getCumulativeFollowerGrowth(days = 730) {
  try {
    // Step 1: Get current total follower count
    console.log('\n📊 Step 1: Getting Current Total Follower Count...\n');
    
    const encodedUrn = encodeURIComponent(ORG_URN);
    const currentResponse = await axios.get(
      `https://api.linkedin.com/rest/networkSizes/${encodedUrn}`,
      {
        params: { 
          edgeType: 'COMPANY_FOLLOWED_BY_MEMBER'  // ✅ CORRECTED: All caps (v202305+)
        },
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202510'
        }
      }
    );
    
    const currentFollowerCount = currentResponse.data.firstDegreeSize || 0;
    console.log(`✅ Current Total Followers: ${currentFollowerCount}`);
    
    // Step 2: Get daily follower gains for the period
    console.log(`\n📊 Step 2: Getting Daily Follower Gains for Last ${days} Days...\n`);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2);  // 2 days ago (LinkedIn requirement)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days - 2);
    
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    
    console.log(`📅 Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const url = `https://api.linkedin.com/rest/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(ORG_URN)}&timeIntervals=(timeRange:(start:${startTimestamp},end:${endTimestamp}),timeGranularityType:DAY)`;
    
    const growthResponse = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202510'
      }
    });
    
    const dailyData = growthResponse.data.elements || [];
    console.log(`✅ Retrieved ${dailyData.length} days of data`);
    
    // Step 3: Calculate total gains in the period
    console.log(`\n📊 Step 3: Calculating Total Gains...\n`);
    
    let totalGains = 0;
    dailyData.forEach(item => {
      const organic = item.followerGains?.organicFollowerGain || 0;
      const paid = item.followerGains?.paidFollowerGain || 0;
      totalGains += organic + paid;
    });
    
    console.log(`📈 Total gains in ${days}-day period: +${totalGains} followers`);
    
    // Step 4: Calculate starting follower count
    const startingFollowerCount = currentFollowerCount - totalGains;
    console.log(`🎯 Starting follower count (${days} days ago): ${startingFollowerCount}`);
    console.log(`🎯 Current follower count (today): ${currentFollowerCount}`);
    
    // Step 5: Build cumulative timeline
    console.log(`\n📊 Step 4: Building Cumulative Timeline...\n`);
    
    let cumulativeFollowers = startingFollowerCount;
    const timelineData = [];
    
    dailyData.forEach(item => {
      const date = new Date(item.timeRange.start);
      const organic = item.followerGains?.organicFollowerGain || 0;
      const paid = item.followerGains?.paidFollowerGain || 0;
      const dailyGain = organic + paid;
      
      // Add the gain to cumulative count
      cumulativeFollowers += dailyGain;
      
      timelineData.push({
        date: date.toISOString().split('T')[0],
        dailyGain: dailyGain,
        organicGain: organic,
        paidGain: paid,
        totalFollowers: cumulativeFollowers,  // ✅ Cumulative total
        timestamp: item.timeRange.start
      });
    });
    
    // Step 6: Add today's data point (extrapolate to current)
    const today = new Date();
    timelineData.push({
      date: today.toISOString().split('T')[0],
      dailyGain: 0,
      organicGain: 0,
      paidGain: 0,
      totalFollowers: currentFollowerCount,  // ✅ Current count (max value)
      timestamp: today.getTime()
    });
    
    // Display results
    console.log('✅ Cumulative Timeline Created!\n');
    console.log('📊 CUMULATIVE FOLLOWER TIMELINE:\n');
    console.log('Date         | Daily Gain | Total Followers');
    console.log('-'.repeat(50));
    
    // Show first 5 days
    timelineData.slice(0, 5).forEach(item => {
      const gainStr = item.dailyGain > 0 ? `+${item.dailyGain}` : ' 0';
      console.log(`${item.date} |     ${gainStr}     |      ${item.totalFollowers}`);
    });
    
    // Show days with gains
    const daysWithGains = timelineData.filter(d => d.dailyGain > 0);
    if (daysWithGains.length > 0 && daysWithGains.length < timelineData.length) {
      console.log('...');
      console.log('📈 Days with follower gains:');
      daysWithGains.forEach(item => {
        console.log(`${item.date} |     +${item.dailyGain}     |      ${item.totalFollowers} ⬆️`);
      });
      console.log('...');
    }
    
    // Show last 5 days
    if (timelineData.length > 10) {
      timelineData.slice(-5).forEach(item => {
        const gainStr = item.dailyGain > 0 ? `+${item.dailyGain}` : ' 0';
        console.log(`${item.date} |     ${gainStr}     |      ${item.totalFollowers}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ANALYSIS COMPLETE!\n');
    console.log('📈 Summary:');
    console.log(`   • Starting Followers: ${startingFollowerCount}`);
    console.log(`   • Current Followers:  ${currentFollowerCount}`);
    console.log(`   • Total Growth:       +${totalGains} followers`);
    console.log(`   • Time Period:        ${days} days`);
    console.log(`   • Data Points:        ${timelineData.length} days`);
    console.log(`   • Graph Range:        ${startingFollowerCount} to ${currentFollowerCount}`);
    
    return {
      success: true,
      currentFollowers: currentFollowerCount,
      startingFollowers: startingFollowerCount,
      totalGain: totalGains,
      period: `${startDate.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`,
      timeline: timelineData,
      
      // Chart-ready format for frontend
      chartData: {
        labels: timelineData.map(d => d.date),
        datasets: [
          {
            label: 'Total Followers',
            data: timelineData.map(d => d.totalFollowers),  // ✅ Cumulative values
            borderColor: 'rgb(0, 119, 181)',
            backgroundColor: 'rgba(0, 119, 181, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: timelineData.map(d => d.dailyGain > 0 ? 5 : 2),  // Highlight gain days
            pointBackgroundColor: timelineData.map(d => d.dailyGain > 0 ? 'rgb(0, 200, 83)' : 'rgb(0, 119, 181)')
          }
        ]
      }
    };
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.status, error.response?.statusText);
    console.error('   Message:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

// Run the analysis - fetch maximum history (730 days / 2 years)
getCumulativeFollowerGrowth(730)
  .then(result => {
    console.log('\n📊 CHART DATA FOR YOUR DASHBOARD:\n');
    console.log('Copy this JSON for your frontend chart:\n');
    console.log(JSON.stringify(result.chartData, null, 2));
    console.log('\n✅ Done! Your graph will show follower count from', result.startingFollowers, 'to', result.currentFollowers);
  })
  .catch(error => {
    console.error('\n❌ Failed to get follower data');
    process.exit(1);
  });

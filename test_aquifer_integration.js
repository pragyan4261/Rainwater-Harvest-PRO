/**
 * Test script to verify the aquifer integration works end-to-end
 * This tests the full flow from frontend input to ML service aquifer analysis
 */

const fetch = require('node-fetch');

// Test configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Sample test data with Bangalore coordinates
const testAssessmentData = {
  roof_area: 100,
  roof_type: "concrete",
  soil_type: "loamy",
  annual_rainfall: 970,
  state: "Karnataka",
  district: "Bangalore Urban",
  latitude: 12.9716,  // Bangalore coordinates
  longitude: 77.5946
};

async function testMLServiceDirect() {
  console.log('\n🧪 Testing ML Service Direct Aquifer Endpoint...');
  
  try {
    const response = await fetch(`${ML_SERVICE_URL}/aquifer-info/${testAssessmentData.latitude}/${testAssessmentData.longitude}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ ML Service Aquifer Response:');
    console.log(`   - Success: ${data.success}`);
    if (data.success && data.nearest_aquifer) {
      console.log(`   - Nearest Aquifer: ${data.nearest_aquifer.name}`);
      console.log(`   - Distance: ${data.distance_km} km`);
      console.log(`   - Type: ${data.aquifer_type}`);
      console.log(`   - Recharge Potential: ${data.recharge_potential}`);
      console.log(`   - Feasibility Score: ${data.feasibility_score}/100`);
      console.log(`   - Assessment: ${data.overall_assessment}`);
      console.log(`   - Recommendations: ${data.recommendations?.length || 0} items`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ ML Service Direct Test Failed:', error.message);
    return null;
  }
}

async function testMLServicePrediction() {
  console.log('\n🧪 Testing ML Service Prediction with Aquifer Data...');
  
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAssessmentData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ ML Service Prediction Response:');
    console.log(`   - Potential Harvest: ${data.potential_harvest} L/year`);
    console.log(`   - Tank Volume: ${data.tank_volume} L`);
    console.log(`   - Feasibility: ${data.feasibility}`);
    console.log(`   - Groundwater Level: ${data.groundwater_level}m`);
    
    if (data.aquifer_info) {
      console.log(`   - Aquifer Integration: ✅ Success`);
      console.log(`   - Nearest Aquifer: ${data.aquifer_info.nearest_aquifer?.name}`);
      console.log(`   - Distance to Aquifer: ${data.aquifer_info.distance_km} km`);
    } else {
      console.log(`   - Aquifer Integration: ❌ Missing`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ ML Service Prediction Test Failed:', error.message);
    return null;
  }
}

async function testHealthChecks() {
  console.log('\n🏥 Testing Health Checks...');
  
  // Test ML Service health
  try {
    const mlHealth = await fetch(`${ML_SERVICE_URL}/health`);
    console.log(`✅ ML Service Health: ${mlHealth.status} ${mlHealth.statusText}`);
  } catch (error) {
    console.log(`❌ ML Service Health: ${error.message}`);
  }
  
  // Test Backend health (if available)
  try {
    const backendHealth = await fetch(`${BACKEND_URL}/api/health`);
    console.log(`✅ Backend Health: ${backendHealth.status} ${backendHealth.statusText}`);
  } catch (error) {
    console.log(`ℹ️  Backend Health: ${error.message} (may not have health endpoint)`);
  }
}

async function runTests() {
  console.log('🚀 Starting Aquifer Integration Tests...');
  console.log(`ML Service URL: ${ML_SERVICE_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Test Location: Bangalore (${testAssessmentData.latitude}, ${testAssessmentData.longitude})`);
  
  // Run all tests
  await testHealthChecks();
  const aquiferData = await testMLServiceDirect();
  const predictionData = await testMLServicePrediction();
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ ML Service Direct Aquifer: ${aquiferData ? 'PASS' : 'FAIL'}`);
  console.log(`✅ ML Service Prediction: ${predictionData ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Aquifer Integration: ${predictionData?.aquifer_info ? 'PASS' : 'FAIL'}`);
  
  if (aquiferData && predictionData?.aquifer_info) {
    console.log('\n🎉 All tests passed! Aquifer integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the frontend by submitting an assessment with coordinates');
    console.log('   2. Verify the Results page displays aquifer information');
    console.log('   3. Check that recommendations are showing correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the ML service logs.');
  }
}

// Run the tests
runTests().catch(console.error);
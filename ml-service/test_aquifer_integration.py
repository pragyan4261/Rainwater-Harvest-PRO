# Test script to verify aquifer integration
import requests
import json

def test_aquifer_integration():
    ML_SERVICE_URL = "http://localhost:8000"
    
    # Test data with Bangalore coordinates
    test_data = {
        "roof_area": 100.0,
        "roof_type": "concrete",
        "soil_type": "loamy",
        "annual_rainfall": 970.0,
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    
    print("🧪 Testing Aquifer Integration...")
    print(f"ML Service URL: {ML_SERVICE_URL}")
    print(f"Test Location: Bangalore ({test_data['latitude']}, {test_data['longitude']})")
    print("-" * 60)
    
    try:
        # Test 1: Direct aquifer info endpoint
        print("\n1️⃣  Testing Direct Aquifer Endpoint...")
        response = requests.get(f"{ML_SERVICE_URL}/aquifer-info/{test_data['latitude']}/{test_data['longitude']}")
        
        if response.status_code == 200:
            aquifer_data = response.json()
            print("✅ Aquifer endpoint works!")
            print(f"   - Success: {aquifer_data.get('success')}")
            if aquifer_data.get('success') and aquifer_data.get('nearest_aquifer'):
                print(f"   - Nearest Aquifer: {aquifer_data['nearest_aquifer']['name']}")
                print(f"   - Distance: {aquifer_data.get('distance_km')} km")
                print(f"   - Type: {aquifer_data.get('aquifer_type')}")
                print(f"   - Feasibility Score: {aquifer_data.get('feasibility_score')}/100")
        else:
            print(f"❌ Aquifer endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Direct aquifer test failed: {str(e)}")
    
    try:
        # Test 2: Prediction endpoint with aquifer integration
        print("\n2️⃣  Testing Prediction with Aquifer Integration...")
        response = requests.post(f"{ML_SERVICE_URL}/predict", json=test_data)
        
        if response.status_code == 200:
            prediction_data = response.json()
            print("✅ Prediction endpoint works!")
            print(f"   - Potential Harvest: {prediction_data.get('potential_harvest')} L/year")
            print(f"   - Feasibility: {prediction_data.get('feasibility')}")
            print(f"   - Groundwater Level: {prediction_data.get('groundwater_level')}m")
            
            if prediction_data.get('aquifer_info'):
                print("✅ Aquifer integration successful!")
                aquifer_info = prediction_data['aquifer_info']
                if aquifer_info.get('success') and aquifer_info.get('nearest_aquifer'):
                    print(f"   - Nearest Aquifer: {aquifer_info['nearest_aquifer']['name']}")
                    print(f"   - Distance: {aquifer_info.get('distance_km')} km")
                    print(f"   - Recommendations: {len(aquifer_info.get('recommendations', []))} items")
                else:
                    print(f"   - Aquifer error: {aquifer_info.get('error', 'Unknown error')}")
            else:
                print("❌ Aquifer integration missing from prediction!")
        else:
            print(f"❌ Prediction endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Prediction test failed: {str(e)}")
    
    print("\n" + "="*60)
    print("🎯 AQUIFER INTEGRATION TEST COMPLETE")
    print("Next Steps:")
    print("1. Submit an assessment through the frontend with coordinates")
    print("2. Check the Results page for aquifer information display")
    print("3. Verify recommendations are showing correctly")
    print("="*60)

if __name__ == "__main__":
    test_aquifer_integration()
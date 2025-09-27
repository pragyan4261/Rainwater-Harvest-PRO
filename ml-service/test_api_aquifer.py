#!/usr/bin/env python3
"""
Test the ML service API with aquifer information
"""
import requests
import json

def test_ml_service():
    """Test the ML service with sample data"""
    
    # Test data - Bangalore coordinates
    test_data = {
        "roof_area": 100.0,
        "roof_type": "concrete",
        "soil_type": "clay",
        "annual_rainfall": 850.0,
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    
    print("🧪 Testing ML Service API with Aquifer Information")
    print("=" * 60)
    print(f"📍 Test Location: Bangalore, Karnataka")
    print(f"🏠 Roof Area: {test_data['roof_area']} sq m")
    print(f"🌧️ Annual Rainfall: {test_data['annual_rainfall']} mm")
    print("-" * 60)
    
    # Test local development server
    url = "http://localhost:8000/calculate"
    
    try:
        response = requests.post(url, json=test_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ ML Service Response Successful!")
            print("-" * 40)
            
            # Display main results
            print(f"💧 Potential Harvest: {result.get('potential_harvest', 'N/A')} L/year")
            print(f"🏺 Tank Volume: {result.get('tank_volume', 'N/A')} L")
            print(f"⚡ Efficiency: {result.get('efficiency', 'N/A')}%")
            print(f"🌊 Groundwater Level: {result.get('groundwater_level', 'N/A')} m")
            print(f"✨ Feasibility: {result.get('feasibility', 'N/A')}")
            
            # Display aquifer information
            aquifer_info = result.get('aquifer_info')
            if aquifer_info:
                print("\n🏞️ AQUIFER INFORMATION:")
                print("-" * 30)
                if aquifer_info.get('success'):
                    nearest = aquifer_info.get('nearest_aquifer', {})
                    print(f"📍 Nearest Aquifer: {nearest.get('name', 'Unknown')}")
                    print(f"📏 Distance: {aquifer_info.get('distance_km', 'N/A')} km")
                    print(f"🗻 Type: {aquifer_info.get('aquifer_type', 'Unknown')}")
                    print(f"🔄 Recharge Potential: {aquifer_info.get('recharge_potential', 'Unknown')}")
                    print(f"📊 Feasibility Score: {aquifer_info.get('feasibility_score', 'N/A')}/100")
                    print(f"🎯 Assessment: {aquifer_info.get('overall_assessment', 'N/A')}")
                    
                    # Display recommendations
                    recommendations = aquifer_info.get('recommendations', [])
                    if recommendations:
                        print(f"\n💡 AQUIFER RECOMMENDATIONS:")
                        for i, rec in enumerate(recommendations, 1):
                            print(f"   {i}. {rec}")
                    
                    # Display statistics
                    stats = aquifer_info.get('statistics', {})
                    if stats:
                        print(f"\n📈 REGIONAL STATISTICS:")
                        print(f"   • Nearby Aquifers: {stats.get('total_nearby_aquifers', 'N/A')}")
                        print(f"   • Average Distance: {stats.get('average_distance', 'N/A')} km")
                        print(f"   • Most Common Type: {stats.get('most_common_type', 'N/A')}")
                        print(f"   • Recharge Summary: {stats.get('recharge_potential_summary', 'N/A')}")
                else:
                    print(f"❌ Aquifer Info Error: {aquifer_info.get('error', 'Unknown error')}")
            else:
                print("⚠️ No aquifer information available")
                
            # Display cost estimation
            cost_est = result.get('cost_estimation', {})
            if cost_est:
                print(f"\n💰 COST ESTIMATION:")
                print("-" * 20)
                print(f"🏺 Storage Tank: ₹{cost_est.get('storage_tank', 0):,.2f}")
                print(f"🕳️ Recharge Pit: ₹{cost_est.get('recharge_pit', 0):,.2f}")
                print(f"🚰 Gutters/Pipes: ₹{cost_est.get('gutters_pipes', 0):,.2f}")
                print(f"🧹 Filtration: ₹{cost_est.get('filtration_system', 0):,.2f}")
                print(f"🔧 Installation: ₹{cost_est.get('installation', 0):,.2f}")
                print("-" * 20)
                print(f"💵 Total: ₹{cost_est.get('total', 0):,.2f}")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: ML Service not running")
        print("💡 Start the service with: python app.py")
        print("🌐 Or ensure the service is running on http://localhost:8000")
    except requests.exceptions.Timeout:
        print("⏰ Request Timeout: Service taking too long to respond")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_ml_service()
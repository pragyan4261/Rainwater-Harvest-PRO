#!/usr/bin/env python3
"""
Test the complete ML service API
"""

import requests
import json

def test_ml_api():
    """Test the ML API endpoints"""
    
    # API endpoint (adjust port if needed)
    base_url = "http://localhost:8001"  # Using port 8001 to avoid conflicts
    
    # Test data
    test_payload = {
        "roof_area": 150,
        "roof_type": "RCC",
        "soil_type": "loam",
        "annual_rainfall": 1000
    }
    
    print("Testing ML Service API")
    print("=" * 50)
    print(f"Endpoint: {base_url}/predict")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        # Test /predict endpoint
        response = requests.post(
            f"{base_url}/predict",
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ API Response Success!")
            print("=" * 50)
            
            # Display results nicely
            print(f"Potential Harvest: {result.get('potential_harvest', 0):,.0f} L/year")
            print(f"Tank Volume: {result.get('tank_volume', 0):,.0f} L")
            print(f"Efficiency: {result.get('efficiency', 0):.1f}%")
            print(f"Feasibility: {result.get('feasibility', 'N/A')}")
            
            # Cost estimation
            cost_est = result.get('cost_estimation', {})
            if cost_est:
                print(f"\nCost Estimation ({cost_est.get('currency', 'INR')}):")
                print(f"  Storage Tank: ₹{cost_est.get('storage_tank', 0):,.2f}")
                print(f"  Recharge Pit: ₹{cost_est.get('recharge_pit', 0):,.2f}")
                print(f"  Gutters/Pipes: ₹{cost_est.get('gutters_pipes', 0):,.2f}")
                print(f"  Filtration: ₹{cost_est.get('filtration_system', 0):,.2f}")
                print(f"  Installation: ₹{cost_est.get('installation', 0):,.2f}")
                print(f"  TOTAL: ₹{cost_est.get('total', 0):,.2f}")
                print(f"  Model: {cost_est.get('model_used', 'N/A')}")
            
            # ROI
            roi = result.get('roi', {})
            if roi:
                print(f"\nROI Analysis:")
                print(f"  Annual Savings: ₹{roi.get('annual_savings', 0):,.2f}")
                print(f"  Payback Period: {roi.get('payback_period', 'N/A')}")
                print(f"  Water Saved: {roi.get('water_saved', 0):,} L/year")
                print(f"  Runoff Reduction: {roi.get('runoff_reduction', 'N/A')}")
                
            # Structures
            structures = result.get('recommended_structures', [])
            if structures:
                print(f"\nRecommended Structures:")
                for structure in structures:
                    print(f"  • {structure.get('name', 'N/A')}: {structure.get('description', 'N/A')}")
                    
            print(f"\nGroundwater Level: {result.get('groundwater_level', 0)}m")
            print(f"Rainfall Distribution: {result.get('rainfall_distribution', [])}")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Is the ML service running?")
        print("Try running: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test health endpoint
    try:
        health_response = requests.get(f"{base_url}/health", timeout=5)
        if health_response.status_code == 200:
            print(f"\n✅ Health Check: {health_response.json()}")
        else:
            print(f"\n❌ Health Check Failed: {health_response.status_code}")
    except:
        print("\n❌ Health Check Failed: Connection error")

if __name__ == "__main__":
    test_ml_api()
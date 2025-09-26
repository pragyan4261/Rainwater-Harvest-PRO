#!/usr/bin/env python3
"""
Test script for the integrated ML-based rainwater harvesting cost prediction
"""

import k_means_v3
import json

def test_prediction():
    """Test the complete prediction pipeline"""
    
    # Test parameters
    test_cases = [
        {
            "name": "Small House",
            "roof_area": 100,  # 100 sq meters
            "roof_type": "RCC",
            "soil_type": "loam", 
            "rainfall": 900  # mm annually
        },
        {
            "name": "Large House", 
            "roof_area": 200,
            "roof_type": "tile",
            "soil_type": "clay",
            "rainfall": 1200
        },
        {
            "name": "Commercial Building",
            "roof_area": 500,
            "roof_type": "concrete", 
            "soil_type": "sandy",
            "rainfall": 800
        }
    ]
    
    for test_case in test_cases:
        print(f"\n{'='*50}")
        print(f"Testing: {test_case['name']}")
        print(f"{'='*50}")
        
        try:
            result = k_means_v3.predict_harvest(
                roof_area=test_case["roof_area"],
                roof_type=test_case["roof_type"], 
                soil_type=test_case["soil_type"],
                rainfall=test_case["rainfall"]
            )
            
            print(f"Roof Area: {test_case['roof_area']} m²")
            print(f"Roof Type: {test_case['roof_type']}")
            print(f"Soil Type: {test_case['soil_type']}")
            print(f"Annual Rainfall: {test_case['rainfall']} mm")
            print()
            
            print("HARVEST PREDICTION:")
            print(f"  Potential Harvest: {result['potential_harvest']:,.0f} L/year")
            print(f"  Tank Volume: {result['tank_volume']:,.0f} L")
            print(f"  Efficiency: {result['efficiency']:.1f}%")
            print(f"  Feasibility: {result['feasibility']}")
            print()
            
            print("COST ESTIMATION (INR):")
            cost_est = result['cost_estimation']
            print(f"  Storage Tank: ₹{cost_est['storage_tank']:,.2f}")
            print(f"  Recharge Pit: ₹{cost_est['recharge_pit']:,.2f}")
            print(f"  Gutters & Pipes: ₹{cost_est['gutters_pipes']:,.2f}")
            print(f"  Filtration System: ₹{cost_est['filtration_system']:,.2f}")
            print(f"  Installation: ₹{cost_est['installation']:,.2f}")
            print(f"  TOTAL: ₹{cost_est['total']:,.2f}")
            print(f"  Model Used: {cost_est.get('model_used', 'N/A')}")
            print()
            
            print("RETURN ON INVESTMENT:")
            roi = result['roi']
            print(f"  Annual Savings: ₹{roi['annual_savings']:,.2f}")
            print(f"  Payback Period: {roi['payback_period']}")
            print(f"  Water Saved: {roi['water_saved']:,} L/year")
            print(f"  Runoff Reduction: {roi['runoff_reduction']}")
            print()
            
            print("RECOMMENDATIONS:")
            for structure in result['recommended_structures']:
                print(f"  • {structure['name']}: {structure['description']}")
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_prediction()
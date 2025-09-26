#!/usr/bin/env python3
"""Test script to check ML API response directly"""

from app import AssessmentInput, _run_prediction

def test_api_response():
    # Create test input
    test_input = AssessmentInput(
        roof_area=100,
        roof_type="RCC",
        soil_type="loam",
        annual_rainfall=1200
    )
    
    print("Testing ML API with input:")
    print(f"  Roof Area: {test_input.roof_area} m²")
    print(f"  Roof Type: {test_input.roof_type}")
    print(f"  Soil Type: {test_input.soil_type}")
    print(f"  Annual Rainfall: {test_input.annual_rainfall} mm")
    print()
    
    # Get prediction result
    result = _run_prediction(test_input)
    
    print("API Response:")
    print("=" * 50)
    
    print(f"Feasibility: {result['feasibility']}")
    print(f"Potential Harvest: {result['potential_harvest']:.2f} L/year")
    print(f"Tank Volume: {result['tank_volume']:.2f} L")
    print(f"Efficiency: {result['efficiency']:.2f}%")
    print()
    
    print("Cost Estimation:")
    cost = result['cost_estimation']
    print(f"  Storage Tank: ₹{cost['storage_tank']:,.2f}")
    print(f"  Recharge Pit: ₹{cost['recharge_pit']:,.2f}")
    print(f"  Gutters & Pipes: ₹{cost['gutters_pipes']:,.2f}")
    print(f"  Filtration System: ₹{cost['filtration_system']:,.2f}")
    print(f"  Installation: ₹{cost['installation']:,.2f}")
    print(f"  Total: ₹{cost['total']:,.2f}")
    print(f"  Currency: {cost['currency']}")
    print(f"  Model Used: {cost.get('model_used', 'Unknown')}")
    print()
    
    print("ROI:")
    roi = result['roi']
    print(f"  Annual Savings: ₹{roi['annual_savings']:,.2f}")
    print(f"  Payback Period: {roi['payback_period']}")
    print(f"  Water Saved: {roi['water_saved']:,.2f} L/year")
    print(f"  Runoff Reduction: {roi['runoff_reduction']}")
    print()
    
    # Check if cost components are non-zero
    zero_components = []
    for component, value in cost.items():
        if component not in ['currency', 'model_used'] and value == 0:
            zero_components.append(component)
    
    if zero_components:
        print(f"⚠️  WARNING: These components show ₹0 cost: {', '.join(zero_components)}")
    else:
        print("✅ All cost components have non-zero values!")
    
    return result

if __name__ == "__main__":
    test_api_response()
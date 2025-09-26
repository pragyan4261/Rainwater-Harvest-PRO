#!/usr/bin/env python3
"""
Test enhanced cost estimation
"""

import k_means_v3

def test_enhanced_costs():
    """Test the enhanced cost breakdown"""
    
    test_cases = [
        {"name": "Small Home", "area": 80, "type": "tile", "soil": "sandy", "rainfall": 800},
        {"name": "Medium Home", "area": 150, "type": "RCC", "soil": "loam", "rainfall": 1000},  
        {"name": "Large Home", "area": 250, "type": "concrete", "soil": "clay", "rainfall": 1200},
        {"name": "Villa", "area": 400, "type": "RCC", "soil": "rocky", "rainfall": 900}
    ]
    
    for case in test_cases:
        print(f"\n{'='*60}")
        print(f"Testing: {case['name']}")
        print(f"Area: {case['area']}m² | Roof: {case['type']} | Soil: {case['soil']} | Rainfall: {case['rainfall']}mm")
        print(f"{'='*60}")
        
        try:
            result = k_means_v3.predict_harvest(
                roof_area=case['area'],
                roof_type=case['type'], 
                soil_type=case['soil'],
                rainfall=case['rainfall']
            )
            
            cost = result['cost_estimation']
            
            print(f"HARVEST POTENTIAL:")
            print(f"  Potential Harvest: {result['potential_harvest']:,.0f} L/year")
            print(f"  Tank Volume: {result['tank_volume']:,.0f} L")
            print(f"  Feasibility: {result['feasibility']}")
            
            print(f"\nDETAILED COST BREAKDOWN (INR):")
            print(f"  Storage Tank: ₹{cost['storage_tank']:>12,.2f}")
            print(f"  Recharge Pit: ₹{cost['recharge_pit']:>12,.2f}")
            print(f"  Gutters & Pipes: ₹{cost['gutters_pipes']:>10,.2f}")
            print(f"  Filtration System: ₹{cost['filtration_system']:>8,.2f}")
            print(f"  Installation: ₹{cost['installation']:>12,.2f}")
            print(f"  {'='*40}")
            print(f"  TOTAL COST: ₹{cost['total']:>15,.2f}")
            
            # Show cost breakdown if available
            if 'breakdown' in cost:
                breakdown = cost['breakdown']
                print(f"\nCOST DETAILS:")
                if 'tank_cost_per_liter' in breakdown:
                    print(f"  Tank Rate: ₹{breakdown['tank_cost_per_liter']}/liter")
                if 'soil_multiplier' in breakdown:
                    print(f"  Soil Multiplier: {breakdown['soil_multiplier']}x")
                if 'system_complexity' in breakdown:
                    print(f"  Complexity: {breakdown['system_complexity']}")
            
            # ROI Information
            roi = result['roi']
            print(f"\nROI ANALYSIS:")
            print(f"  Annual Savings: ₹{roi['annual_savings']:,.2f}")
            print(f"  Payback Period: {roi['payback_period']}")
            
            # Cost per liter of harvest
            cost_per_liter_harvest = cost['total'] / result['potential_harvest'] if result['potential_harvest'] > 0 else 0
            print(f"  Cost per Liter of Annual Harvest: ₹{cost_per_liter_harvest:.3f}")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_costs()
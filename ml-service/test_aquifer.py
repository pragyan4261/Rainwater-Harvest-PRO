#!/usr/bin/env python3
"""
Test script for aquifer finder functionality
"""
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from aquifer_data import AquiferFinder, get_nearest_aquifer_info
    print("✅ Successfully imported aquifer modules")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Installing geopy manually...")
    os.system("pip install geopy")
    try:
        from aquifer_data import AquiferFinder, get_nearest_aquifer_info
        print("✅ Successfully imported after installing geopy")
    except ImportError as e2:
        print(f"❌ Still failed after installing geopy: {e2}")
        sys.exit(1)

def test_aquifer_finder():
    """Test the aquifer finder with various locations"""
    
    test_cases = [
        {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946},
        {"name": "Delhi", "lat": 28.7041, "lon": 77.1025},
        {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
        {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
        {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
    ]
    
    finder = AquiferFinder()
    print(f"\n🔍 Testing Aquifer Finder with {len(test_cases)} locations")
    print("=" * 60)
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing {case['name']} ({case['lat']}, {case['lon']})")
        print("-" * 40)
        
        try:
            # Test the main function
            result = get_nearest_aquifer_info(case['lat'], case['lon'])
            
            if result['success']:
                print(f"✅ Success!")
                print(f"   Nearest Aquifer: {result['nearest_aquifer']['name']}")
                print(f"   Distance: {result['distance_km']} km")
                print(f"   Type: {result['aquifer_type']}")
                print(f"   Recharge Potential: {result['recharge_potential']}")
                print(f"   Feasibility Score: {result['feasibility_score']}/100")
                print(f"   Assessment: {result['overall_assessment']}")
                
                if result.get('recommendations'):
                    print(f"   Recommendations:")
                    for j, rec in enumerate(result['recommendations'][:2], 1):
                        print(f"     {j}. {rec}")
                        
                if result.get('statistics'):
                    stats = result['statistics']
                    print(f"   Statistics: {stats['total_nearby_aquifers']} nearby, "
                          f"avg {stats['average_distance']}km, {stats['most_common_type']} type")
            else:
                print(f"❌ Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print(f"\n{'='*60}")
    print("Testing completed!")

def test_dataset_integrity():
    """Test the dataset integrity"""
    print("\n📊 Testing Dataset Integrity")
    print("-" * 30)
    
    finder = AquiferFinder()
    
    print(f"Total aquifers in dataset: {len(finder.aquifer_df)}")
    print(f"Unique states: {finder.aquifer_df['state'].nunique()}")
    print(f"Aquifer types: {finder.aquifer_df['type'].unique()}")
    print(f"Recharge potentials: {finder.aquifer_df['recharge_potential'].unique()}")
    
    # Check for missing coordinates
    missing_coords = finder.aquifer_df[
        (finder.aquifer_df['latitude'].isna()) | 
        (finder.aquifer_df['longitude'].isna())
    ]
    
    if len(missing_coords) > 0:
        print(f"⚠️  Warning: {len(missing_coords)} aquifers have missing coordinates")
    else:
        print("✅ All aquifers have valid coordinates")

if __name__ == "__main__":
    print("🌊 Aquifer Finder Test Suite")
    print("=" * 60)
    
    test_dataset_integrity()
    test_aquifer_finder()
    
    print("\n✨ All tests completed!")
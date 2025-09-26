"""
Indian Rainwater Harvesting Cost Breakdown Reference

This file contains detailed cost breakdowns for rainwater harvesting systems in India.
All costs are in Indian Rupees (INR) and based on 2024-2025 market rates.
"""

class IndianRWHCostReference:
    """
    Reference class for Indian Rainwater Harvesting costs
    """
    
    # STORAGE TANK COSTS (INR per liter)
    TANK_COSTS = {
        'small_plastic': {
            'range': '500-1000L',
            'cost_per_liter': 35,
            'material': 'Food-grade plastic/Fiberglass',
            'includes': ['Tank body', 'Lid', 'Outlet valve', 'Overflow pipe'],
            'additional': 'Basic fittings (12% extra)'
        },
        'medium_plastic': {
            'range': '1000-5000L', 
            'cost_per_liter': 42,
            'material': 'Reinforced plastic/Fiberglass with steel frame',
            'includes': ['Tank', 'Stand/base', 'Multi-point outlets', 'Level indicator'],
            'additional': 'Enhanced fittings (15% extra)'
        },
        'large_concrete': {
            'range': '5000-15000L',
            'cost_per_liter': 48,
            'material': 'Ferrocement/Precast concrete',
            'includes': ['Tank construction', 'Waterproofing', 'Multiple outlets', 'Manhole cover'],
            'additional': 'Professional fittings (18% extra)'
        },
        'very_large_rcc': {
            'range': '15000L+',
            'cost_per_liter': 55,
            'material': 'RCC construction with steel reinforcement',
            'includes': ['Full construction', 'Waterproofing', 'Distribution system', 'Access provisions'],
            'additional': 'Complete fitting system (20% extra)'
        }
    }
    
    # RECHARGE PIT COSTS
    RECHARGE_PIT_COSTS = {
        'base_cost': 12000,  # INR for standard 6x6x6 feet pit
        'components': {
            'excavation': 'Manual/machine digging based on soil type',
            'filter_media': '₹3000 per 100m² - Gravel, coarse sand, fine sand layers',
            'masonry_lining': '₹8000 per 100m² - Brick/stone lining for stability',
            'cover_slab': 'RCC slab with inspection chamber'
        },
        'soil_multipliers': {
            'sandy': {
                'factor': 1.0,
                'reason': 'Easy excavation, natural infiltration, minimal lining needed'
            },
            'loam': {
                'factor': 1.4,
                'reason': 'Moderate excavation, additional filter media required'
            },
            'clay': {
                'factor': 1.8,
                'reason': 'Difficult excavation, extensive drainage layers needed'
            },
            'rocky': {
                'factor': 2.5,
                'reason': 'Very difficult excavation, specialized equipment, rock breaking'
            }
        }
    }
    
    # GUTTERS & PIPES COSTS
    GUTTER_PIPE_COSTS = {
        'pvc_gutters': {
            'cost_per_meter': 450,  # INR
            'specifications': '6-inch PVC gutters with brackets',
            'includes': ['Gutter channel', 'End caps', 'Mounting brackets', 'Slope adjustment']
        },
        'downpipes': {
            'cost_per_meter': 280,  # INR
            'specifications': '4-6 inch PVC pipes with fittings',
            'includes': ['Pipes', 'Elbows', 'Couplers', 'Wall brackets']
        },
        'fittings_allowance': {
            'percentage': 25,
            'includes': ['Leaf guards', 'Rainwater heads', 'Underground connections', 'Inspection chambers']
        }
    }
    
    # FILTRATION SYSTEM COSTS
    FILTRATION_COSTS = {
        'basic_sand_filter': {
            'cost': 8000,  # INR
            'components': ['Sand layers', 'Gravel bed', 'Collection chamber', 'Outlet system'],
            'capacity': 'Up to 5000L tanks'
        },
        'first_flush_diverter': {
            'cost': 3500,  # INR
            'description': 'Essential for Indian conditions - diverts first contaminated water',
            'includes': ['Diverter chamber', 'Ball valve system', 'Overflow pipe', 'Collection chamber']
        },
        'advanced_filtration': {
            'cost': 12000,  # INR
            'for_systems': 'Above 5000L capacity',
            'includes': ['Multi-stage sand filter', 'Activated carbon layer', 'Fine filtration', 'Backwash system']
        },
        'uv_treatment': {
            'cost': 6000,  # INR
            'for_systems': 'Above 10000L capacity',
            'includes': ['UV sterilization unit', 'Electronic ballast', 'Quartz sleeve', 'UV lamp']
        }
    }
    
    # INSTALLATION COSTS
    INSTALLATION_RATES = {
        'simple': {
            'percentage': 16,
            'roof_area': 'Under 100m²',
            'complexity': 'Basic single-point collection, ground-level tank'
        },
        'medium': {
            'percentage': 18,
            'roof_area': '100-300m²',
            'complexity': 'Multi-point collection, elevated storage, moderate piping'
        },
        'complex': {
            'percentage': 22,
            'roof_area': 'Above 300m²',
            'complexity': 'Multiple collection points, large storage, extensive distribution'
        },
        'additional_costs': {
            'transportation': '3% of material cost',
            'supervision': '2% of material cost',
            'permits_approvals': 'Variable by location'
        }
    }
    
    # REGIONAL VARIATIONS (Multipliers for different Indian regions)
    REGIONAL_MULTIPLIERS = {
        'metro_cities': {
            'factor': 1.2,
            'cities': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
            'reason': 'Higher labor and transportation costs'
        },
        'tier_2_cities': {
            'factor': 1.0,
            'cities': ['Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi'],
            'reason': 'Standard rates'
        },
        'smaller_towns': {
            'factor': 0.85,
            'reason': 'Lower labor costs, but potentially higher material transport costs'
        }
    }
    
    @staticmethod
    def get_detailed_breakdown(tank_volume, roof_area, soil_type='loam'):
        """
        Get detailed cost breakdown with explanations
        """
        breakdown = {
            'tank_category': IndianRWHCostReference.get_tank_category(tank_volume),
            'pit_complexity': IndianRWHCostReference.RECHARGE_PIT_COSTS['soil_multipliers'].get(soil_type, 
                                IndianRWHCostReference.RECHARGE_PIT_COSTS['soil_multipliers']['loam']),
            'installation_complexity': IndianRWHCostReference.get_installation_complexity(roof_area),
            'regional_note': 'Costs are for Tier-2 cities. Adjust for metro cities (+20%) or smaller towns (-15%)'
        }
        return breakdown
    
    @staticmethod
    def get_tank_category(volume):
        """Get tank category based on volume"""
        if volume <= 1000:
            return IndianRWHCostReference.TANK_COSTS['small_plastic']
        elif volume <= 5000:
            return IndianRWHCostReference.TANK_COSTS['medium_plastic']
        elif volume <= 15000:
            return IndianRWHCostReference.TANK_COSTS['large_concrete']
        else:
            return IndianRWHCostReference.TANK_COSTS['very_large_rcc']
    
    @staticmethod
    def get_installation_complexity(roof_area):
        """Get installation complexity based on roof area"""
        if roof_area < 100:
            return IndianRWHCostReference.INSTALLATION_RATES['simple']
        elif roof_area < 300:
            return IndianRWHCostReference.INSTALLATION_RATES['medium']
        else:
            return IndianRWHCostReference.INSTALLATION_RATES['complex']

# Example usage and cost explanations
if __name__ == "__main__":
    ref = IndianRWHCostReference()
    
    # Example for a typical Indian home
    example_breakdown = ref.get_detailed_breakdown(
        tank_volume=3000,  # 3000L tank
        roof_area=150,     # 150m² roof
        soil_type='loam'   # Loam soil
    )
    
    print("Example Cost Breakdown for Typical Indian Home:")
    print("=" * 50)
    print(f"Tank Volume: 3000L")
    print(f"Roof Area: 150m²")
    print(f"Soil Type: Loam")
    print()
    
    print("Tank Category:", example_breakdown['tank_category']['material'])
    print("Expected Cost:", f"₹{3000 * example_breakdown['tank_category']['cost_per_liter']:,}")
    print()
    
    print("Recharge Pit Complexity:", example_breakdown['pit_complexity']['reason'])
    print("Soil Factor:", example_breakdown['pit_complexity']['factor'])
    print()
    
    print("Installation Complexity:", example_breakdown['installation_complexity']['complexity'])
    print("Installation Rate:", f"{example_breakdown['installation_complexity']['percentage']}%")
    print()
    
    print("Regional Note:", example_breakdown['regional_note'])
"""
Major Aquifer Areas in India - Coordinates Dataset
Contains latitude, longitude coordinates of major aquifers across India
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from geopy.distance import geodesic

# Major Aquifer Areas in India with their coordinates
MAJOR_AQUIFERS = [
    # Northern India
    {
        "name": "Indo-Gangetic Plains Aquifer",
        "state": "Punjab",
        "latitude": 30.7333,
        "longitude": 76.7794,
        "type": "Alluvial",
        "depth_range": "5-50m",
        "quality": "Good to Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Yamuna-Ganges Aquifer",
        "state": "Uttar Pradesh",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "type": "Alluvial",
        "depth_range": "10-80m",
        "quality": "Good to Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Delhi Ridge Aquifer",
        "state": "Delhi",
        "latitude": 28.7041,
        "longitude": 77.1025,
        "type": "Hard Rock",
        "depth_range": "15-40m",
        "quality": "Moderate",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Thar Desert Aquifer",
        "state": "Rajasthan",
        "latitude": 27.0238,
        "longitude": 74.2179,
        "type": "Sedimentary",
        "depth_range": "30-200m",
        "quality": "Poor to Moderate",
        "recharge_potential": "Low"
    },
    {
        "name": "Aravalli Range Aquifer",
        "state": "Rajasthan",
        "latitude": 26.0173,
        "longitude": 74.2179,
        "type": "Hard Rock",
        "depth_range": "20-100m",
        "quality": "Good",
        "recharge_potential": "Moderate"
    },
    
    # Western India
    {
        "name": "Deccan Trap Aquifer - Maharashtra",
        "state": "Maharashtra",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "type": "Basaltic",
        "depth_range": "10-60m",
        "quality": "Good to Moderate",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Narmada Valley Aquifer",
        "state": "Madhya Pradesh",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "type": "Alluvial",
        "depth_range": "8-45m",
        "quality": "Good",
        "recharge_potential": "High"
    },
    {
        "name": "Gujarat Alluvial Aquifer",
        "state": "Gujarat",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "type": "Alluvial",
        "depth_range": "15-120m",
        "quality": "Good to Poor",
        "recharge_potential": "High"
    },
    {
        "name": "Saurashtra Peninsula Aquifer",
        "state": "Gujarat",
        "latitude": 21.5222,
        "longitude": 70.4579,
        "type": "Basaltic",
        "depth_range": "20-80m",
        "quality": "Moderate",
        "recharge_potential": "Moderate"
    },
    
    # Southern India
    {
        "name": "Bangalore Urban Aquifer",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "type": "Hard Rock",
        "depth_range": "8-35m",
        "quality": "Good to Poor",
        "recharge_potential": "High"
    },
    {
        "name": "Mysore Plateau Aquifer",
        "state": "Karnataka",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "type": "Hard Rock",
        "depth_range": "12-50m",
        "quality": "Good",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Chennai Metropolitan Aquifer",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "type": "Sedimentary",
        "depth_range": "5-25m",
        "quality": "Poor to Moderate",
        "recharge_potential": "Low"
    },
    {
        "name": "Cauvery Delta Aquifer",
        "state": "Tamil Nadu",
        "latitude": 10.7905,
        "longitude": 79.1378,
        "type": "Alluvial",
        "depth_range": "3-20m",
        "quality": "Good to Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Hyderabad Metropolitan Aquifer",
        "state": "Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "type": "Hard Rock",
        "depth_range": "10-45m",
        "quality": "Good to Moderate",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Kerala Coastal Aquifer",
        "state": "Kerala",
        "latitude": 10.8505,
        "longitude": 76.2711,
        "type": "Lateritic",
        "depth_range": "2-15m",
        "quality": "Good",
        "recharge_potential": "High"
    },
    {
        "name": "Andhra Pradesh Coastal Aquifer",
        "state": "Andhra Pradesh",
        "latitude": 15.9129,
        "longitude": 79.7400,
        "type": "Sedimentary",
        "depth_range": "5-30m",
        "quality": "Moderate",
        "recharge_potential": "High"
    },
    
    # Eastern India
    {
        "name": "Bengal Basin Aquifer",
        "state": "West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "type": "Alluvial",
        "depth_range": "10-100m",
        "quality": "Good to Poor",
        "recharge_potential": "High"
    },
    {
        "name": "Ganges Delta Aquifer",
        "state": "West Bengal",
        "latitude": 21.7679,
        "longitude": 88.2426,
        "type": "Deltaic",
        "depth_range": "8-60m",
        "quality": "Poor to Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Chotanagpur Plateau Aquifer",
        "state": "Jharkhand",
        "latitude": 23.6102,
        "longitude": 85.2799,
        "type": "Hard Rock",
        "depth_range": "15-50m",
        "quality": "Good",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Bhubaneswar Urban Aquifer",
        "state": "Odisha",
        "latitude": 20.2961,
        "longitude": 85.8245,
        "type": "Hard Rock",
        "depth_range": "8-40m",
        "quality": "Good to Moderate",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Mahanadi Delta Aquifer",
        "state": "Odisha",
        "latitude": 20.0504,
        "longitude": 85.0985,
        "type": "Deltaic",
        "depth_range": "5-35m",
        "quality": "Good",
        "recharge_potential": "High"
    },
    
    # Central India
    {
        "name": "Vindhyan Basin Aquifer",
        "state": "Madhya Pradesh",
        "latitude": 24.5854,
        "longitude": 78.6568,
        "type": "Sedimentary",
        "depth_range": "20-80m",
        "quality": "Good",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Gondwana Basin Aquifer",
        "state": "Chhattisgarh",
        "latitude": 21.2787,
        "longitude": 81.8661,
        "type": "Sedimentary",
        "depth_range": "25-70m",
        "quality": "Good to Moderate",
        "recharge_potential": "Moderate"
    },
    
    # Northeastern India
    {
        "name": "Brahmaputra Valley Aquifer",
        "state": "Assam",
        "latitude": 26.2006,
        "longitude": 92.9376,
        "type": "Alluvial",
        "depth_range": "5-40m",
        "quality": "Good",
        "recharge_potential": "High"
    },
    {
        "name": "Shillong Plateau Aquifer",
        "state": "Meghalaya",
        "latitude": 25.4670,
        "longitude": 91.3662,
        "type": "Hard Rock",
        "depth_range": "10-35m",
        "quality": "Good",
        "recharge_potential": "High"
    },
    
    # Additional Major Aquifers
    {
        "name": "Indore Urban Aquifer",
        "state": "Madhya Pradesh",
        "latitude": 22.7196,
        "longitude": 75.8577,
        "type": "Basaltic",
        "depth_range": "15-55m",
        "quality": "Good to Moderate",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Pune Metropolitan Aquifer",
        "state": "Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "type": "Basaltic",
        "depth_range": "12-50m",
        "quality": "Good",
        "recharge_potential": "High"
    },
    {
        "name": "Lucknow Urban Aquifer",
        "state": "Uttar Pradesh",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "type": "Alluvial",
        "depth_range": "8-60m",
        "quality": "Good to Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Jaipur Urban Aquifer",
        "state": "Rajasthan",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "type": "Hard Rock",
        "depth_range": "20-80m",
        "quality": "Moderate",
        "recharge_potential": "Low to Moderate"
    },
    {
        "name": "Kochi Coastal Aquifer",
        "state": "Kerala",
        "latitude": 9.9312,
        "longitude": 76.2673,
        "type": "Coastal Sedimentary",
        "depth_range": "3-18m",
        "quality": "Good to Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Visakhapatnam Coastal Aquifer",
        "state": "Andhra Pradesh",
        "latitude": 17.6868,
        "longitude": 83.2185,
        "type": "Coastal Sedimentary",
        "depth_range": "5-25m",
        "quality": "Moderate",
        "recharge_potential": "High"
    },
    {
        "name": "Coimbatore Urban Aquifer",
        "state": "Tamil Nadu",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "type": "Hard Rock",
        "depth_range": "10-40m",
        "quality": "Good",
        "recharge_potential": "Moderate"
    },
    {
        "name": "Nagpur Urban Aquifer",
        "state": "Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "type": "Basaltic",
        "depth_range": "15-45m",
        "quality": "Good to Moderate",
        "recharge_potential": "Moderate"
    },
]


class AquiferFinder:
    """ML Model to find nearest aquifers based on user coordinates."""
    
    def __init__(self):
        self.aquifer_df = pd.DataFrame(MAJOR_AQUIFERS)
        self.coordinates = [(row['latitude'], row['longitude']) for _, row in self.aquifer_df.iterrows()]
    
    def find_nearest_aquifer(self, user_lat: float, user_lon: float, top_n: int = 3) -> List[Dict]:
        """
        Find the nearest aquifers to user location.
        
        Args:
            user_lat: User's latitude
            user_lon: User's longitude
            top_n: Number of nearest aquifers to return
            
        Returns:
            List of dictionaries containing aquifer information and distances
        """
        user_location = (user_lat, user_lon)
        distances = []
        
        for idx, (lat, lon) in enumerate(self.coordinates):
            aquifer_location = (lat, lon)
            distance_km = geodesic(user_location, aquifer_location).kilometers
            
            aquifer_info = self.aquifer_df.iloc[idx].to_dict()
            aquifer_info['distance_km'] = round(distance_km, 2)
            distances.append(aquifer_info)
        
        # Sort by distance and return top N
        distances.sort(key=lambda x: x['distance_km'])
        return distances[:top_n]
    
    def get_aquifer_by_state(self, state: str) -> List[Dict]:
        """Get all aquifers in a specific state."""
        state_aquifers = self.aquifer_df[
            self.aquifer_df['state'].str.lower() == state.lower()
        ]
        return state_aquifers.to_dict('records')
    
    def get_aquifer_statistics(self, user_lat: float, user_lon: float) -> Dict:
        """Get statistical analysis of nearby aquifers."""
        nearest_aquifers = self.find_nearest_aquifer(user_lat, user_lon, top_n=5)
        
        if not nearest_aquifers:
            return {
                'average_distance': 0,
                'nearest_distance': 0,
                'most_common_type': 'Unknown',
                'recharge_potential_summary': 'Unknown'
            }
        
        distances = [aq['distance_km'] for aq in nearest_aquifers]
        types = [aq['type'] for aq in nearest_aquifers]
        recharge_potentials = [aq['recharge_potential'] for aq in nearest_aquifers]
        
        # Find most common type
        type_counts = {}
        for aq_type in types:
            type_counts[aq_type] = type_counts.get(aq_type, 0) + 1
        most_common_type = max(type_counts, key=type_counts.get) if type_counts else 'Unknown'
        
        # Recharge potential summary
        recharge_counts = {}
        for potential in recharge_potentials:
            recharge_counts[potential] = recharge_counts.get(potential, 0) + 1
        most_common_recharge = max(recharge_counts, key=recharge_counts.get) if recharge_counts else 'Unknown'
        
        return {
            'average_distance': round(np.mean(distances), 2),
            'nearest_distance': min(distances),
            'most_common_type': most_common_type,
            'recharge_potential_summary': most_common_recharge,
            'total_nearby_aquifers': len(nearest_aquifers)
        }
    
    def get_aquifer_recommendation(self, user_lat: float, user_lon: float) -> Dict:
        """Get recommendations based on nearest aquifer characteristics."""
        nearest = self.find_nearest_aquifer(user_lat, user_lon, top_n=1)[0]
        distance = nearest['distance_km']
        aquifer_type = nearest['type']
        recharge_potential = nearest['recharge_potential']
        
        # Generate recommendations based on distance and aquifer characteristics
        recommendations = []
        feasibility_score = 100  # Start with perfect score
        
        # Distance-based recommendations
        if distance <= 5:
            recommendations.append("Excellent location - very close to major aquifer")
            feasibility_score += 10
        elif distance <= 15:
            recommendations.append("Good location - reasonably close to aquifer")
            feasibility_score += 5
        elif distance <= 50:
            recommendations.append("Moderate location - within acceptable range of aquifer")
        else:
            recommendations.append("Consider local groundwater surveys - distant from major aquifers")
            feasibility_score -= 20
        
        # Type-based recommendations
        type_recommendations = {
            'Alluvial': "Excellent for recharge - high permeability soils",
            'Hard Rock': "Consider fracture mapping for optimal recharge pit placement",
            'Basaltic': "Good recharge potential through weathered zones",
            'Sedimentary': "Moderate to good recharge depending on lithology",
            'Lateritic': "Good drainage but may need filtration systems",
            'Deltaic': "High recharge potential but monitor salinity",
            'Coastal Sedimentary': "High recharge potential but beware of saltwater intrusion"
        }
        
        recommendations.append(type_recommendations.get(aquifer_type, "Consult hydrogeologist for site-specific advice"))
        
        # Recharge potential recommendations
        if recharge_potential == 'High':
            recommendations.append("High recharge potential - ideal for rainwater harvesting")
            feasibility_score += 15
        elif recharge_potential == 'Moderate':
            recommendations.append("Moderate recharge potential - good for structured recharge")
            feasibility_score += 5
        else:
            recommendations.append("Low recharge potential - focus on storage systems")
            feasibility_score -= 10
        
        feasibility_score = max(0, min(100, feasibility_score))  # Clamp between 0-100
        
        return {
            'nearest_aquifer': nearest,
            'recommendations': recommendations,
            'feasibility_score': feasibility_score,
            'overall_assessment': self._get_overall_assessment(feasibility_score)
        }
    
    def _get_overall_assessment(self, score: int) -> str:
        """Convert feasibility score to assessment text."""
        if score >= 90:
            return "Excellent - Highly Suitable"
        elif score >= 75:
            return "Very Good - Suitable"
        elif score >= 60:
            return "Good - Moderately Suitable"
        elif score >= 45:
            return "Fair - Requires Planning"
        else:
            return "Poor - Challenging Conditions"


# Global instance for use in other modules
aquifer_finder = AquiferFinder()


def get_nearest_aquifer_info(latitude: float, longitude: float) -> Dict:
    """
    Main function to get nearest aquifer information.
    This is the function that will be called from the main ML service.
    """
    try:
        recommendation = aquifer_finder.get_aquifer_recommendation(latitude, longitude)
        stats = aquifer_finder.get_aquifer_statistics(latitude, longitude)
        
        return {
            'success': True,
            'nearest_aquifer': recommendation['nearest_aquifer'],
            'distance_km': recommendation['nearest_aquifer']['distance_km'],
            'aquifer_type': recommendation['nearest_aquifer']['type'],
            'recharge_potential': recommendation['nearest_aquifer']['recharge_potential'],
            'recommendations': recommendation['recommendations'],
            'feasibility_score': recommendation['feasibility_score'],
            'overall_assessment': recommendation['overall_assessment'],
            'statistics': stats
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'nearest_aquifer': None,
            'distance_km': None,
            'aquifer_type': 'Unknown',
            'recharge_potential': 'Unknown',
            'recommendations': ['Unable to determine aquifer information'],
            'feasibility_score': 50,
            'overall_assessment': 'Assessment Unavailable'
        }


if __name__ == "__main__":
    # Test the aquifer finder
    finder = AquiferFinder()
    
    # Test with Bangalore coordinates
    test_lat, test_lon = 12.9716, 77.5946
    print(f"Testing with coordinates: {test_lat}, {test_lon} (Bangalore)")
    
    nearest = finder.find_nearest_aquifer(test_lat, test_lon, top_n=3)
    print("\n=== Nearest Aquifers ===")
    for i, aquifer in enumerate(nearest, 1):
        print(f"{i}. {aquifer['name']} ({aquifer['state']})")
        print(f"   Distance: {aquifer['distance_km']} km")
        print(f"   Type: {aquifer['type']}")
        print(f"   Recharge Potential: {aquifer['recharge_potential']}")
        print()
    
    recommendation = finder.get_aquifer_recommendation(test_lat, test_lon)
    print("=== Recommendations ===")
    for rec in recommendation['recommendations']:
        print(f"• {rec}")
    
    print(f"\nFeasibility Score: {recommendation['feasibility_score']}/100")
    print(f"Overall Assessment: {recommendation['overall_assessment']}")
    
    stats = finder.get_aquifer_statistics(test_lat, test_lon)
    print(f"\n=== Statistics ===")
    print(f"Average distance to 5 nearest aquifers: {stats['average_distance']} km")
    print(f"Nearest aquifer distance: {stats['nearest_distance']} km")
    print(f"Most common aquifer type in area: {stats['most_common_type']}")
    print(f"Area recharge potential: {stats['recharge_potential_summary']}")
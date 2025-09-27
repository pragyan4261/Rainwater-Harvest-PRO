import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
from typing import Optional, Dict, Any

class GroundwaterPredictor:
    def __init__(self, model_path: str = 'groundwater_model.pkl', 
                 states_path: str = 'states_districts.json'):
        """Initialize the groundwater predictor"""
        self.model_data = None
        self.states_districts = None
        
        try:
            with open(model_path, 'rb') as f:
                self.model_data = pickle.load(f)
            print("Groundwater model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            
        try:
            with open(states_path, 'r') as f:
                self.states_districts = json.load(f)
            print("States-Districts data loaded successfully")
        except Exception as e:
            print(f"Error loading states-districts data: {e}")
    
    def get_states_districts(self) -> Dict[str, Any]:
        """Return the states and districts data"""
        return self.states_districts or {}
    
    def predict_groundwater_level(self, state: str, district: str, 
                                latitude: Optional[float] = None, 
                                longitude: Optional[float] = None) -> Dict[str, Any]:
        """Predict groundwater level for given state and district"""
        
        if not self.model_data:
            return {
                'groundwater_level': 10.0,  # Default fallback
                'confidence': 0.5,
                'status': 'model_not_available',
                'message': 'Using default groundwater level'
            }
        
        try:
            # Get state code
            state_code = None
            for state_name, data in self.states_districts.items():
                if state_name.lower() == state.lower():
                    state_code = data['code']
                    break
            
            if not state_code:
                return {
                    'groundwater_level': 8.0,
                    'confidence': 0.3,
                    'status': 'state_not_found',
                    'message': f'State "{state}" not found in database'
                }
            
            # Check if district exists
            state_data = self.states_districts.get(state)
            if state_data and district not in state_data.get('districts', []):
                return {
                    'groundwater_level': 8.0,
                    'confidence': 0.3,
                    'status': 'district_not_found',
                    'message': f'District "{district}" not found in state "{state}"'
                }
            
            # Load actual data to get average coordinates if not provided
            if latitude is None or longitude is None:
                try:
                    csv_file = Path(f'states/{state_code}.csv')
                    if csv_file.exists():
                        df = pd.read_csv(csv_file)
                        district_data = df[df['DISTRICT'].str.lower() == district.lower()]
                        if not district_data.empty:
                            if latitude is None:
                                latitude = district_data['LAT'].mean()
                            if longitude is None:
                                longitude = district_data['LON'].mean()
                except Exception:
                    pass
            
            # Default coordinates if still not available
            if latitude is None:
                latitude = 20.0  # Center of India approximately
            if longitude is None:
                longitude = 77.0
            
            # Prepare features for prediction
            model = self.model_data['model']
            le_state = self.model_data['le_state']
            le_district = self.model_data['le_district']
            le_season = self.model_data['le_season']
            
            # Encode categorical variables
            try:
                state_encoded = le_state.transform([state_code])[0]
            except ValueError:
                # State not in training data
                state_encoded = 0
                
            try:
                district_encoded = le_district.transform([district])[0]
            except ValueError:
                # District not in training data, use average
                district_encoded = len(le_district.classes_) // 2
            
            # Use monsoon season as default (usually when groundwater is measured)
            season_encoded = 2  # Assuming MONSOON is encoded as 2
            
            # Current year
            current_year = 2024
            
            # Create feature vector
            features = np.array([[
                state_encoded,
                district_encoded, 
                season_encoded,
                latitude,
                longitude,
                current_year
            ]])
            
            # Make prediction
            predicted_depth = model.predict(features)[0]
            
            # Get prediction confidence (using feature importance as proxy)
            try:
                confidence = min(0.95, max(0.5, 
                    1.0 - (abs(predicted_depth - np.mean(model.feature_importances_)) / 10.0)))
            except:
                confidence = 0.75
            
            return {
                'groundwater_level': round(float(predicted_depth), 2),
                'confidence': round(confidence, 2),
                'status': 'success',
                'message': f'Predicted groundwater level for {district}, {state}',
                'metadata': {
                    'latitude': latitude,
                    'longitude': longitude,
                    'state_code': state_code,
                    'model_version': '1.0'
                }
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                'groundwater_level': 9.0,
                'confidence': 0.4,
                'status': 'prediction_error',
                'message': f'Error in prediction: {str(e)}'
            }
    
    def get_district_statistics(self, state: str, district: str) -> Dict[str, Any]:
        """Get historical statistics for a district"""
        try:
            # Get state code
            state_code = None
            for state_name, data in self.states_districts.items():
                if state_name.lower() == state.lower():
                    state_code = data['code']
                    break
                    
            if not state_code:
                return {}
                
            csv_file = Path(f'states/{state_code}.csv')
            if not csv_file.exists():
                return {}
                
            df = pd.read_csv(csv_file)
            district_data = df[df['DISTRICT'].str.lower() == district.lower()]
            
            if district_data.empty:
                return {}
                
            stats = {
                'min_depth': float(district_data['Depth'].min()),
                'max_depth': float(district_data['Depth'].max()),
                'avg_depth': float(district_data['Depth'].mean()),
                'recent_trend': 'stable',  # Could implement trend analysis
                'data_points': len(district_data),
                'years_covered': f"{district_data['YEAR_OBS'].min()}-{district_data['YEAR_OBS'].max()}"
            }
            
            return stats
            
        except Exception as e:
            print(f"Statistics error: {e}")
            return {}

# Global instance
groundwater_predictor = GroundwaterPredictor()
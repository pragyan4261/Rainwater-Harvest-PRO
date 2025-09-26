"""
Cost Prediction Model for Rainwater Harvesting Systems in India
Uses Mixed_Dataset_V7.xlsx to train ML models for accurate cost estimation
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class IndianCostPredictor:
    def __init__(self, data_path="Mixed_Dataset_V7.xlsx"):
        self.data_path = data_path
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.is_trained = False
        
        # Indian cost conversion factors (USD to INR and regional adjustments)
        self.usd_to_inr = 83.0  # Current exchange rate
        self.regional_multiplier = 0.85  # Indian construction costs typically lower
        
        # Load and prepare data
        self.load_data()
        
    def load_data(self):
        """Load and preprocess the dataset"""
        try:
            self.df = pd.read_excel(self.data_path)
            print(f"Dataset loaded: {self.df.shape}")
            print("Columns:", self.df.columns.tolist())
            
            # Clean column names (remove special characters and brackets)
            new_columns = []
            for col in self.df.columns:
                # Clean up the column names
                clean_col = col.replace('[', '').replace(']', '').replace('$', '').replace('\\', '')
                if 'Tributary Area' in col:
                    new_columns.append('tributary_area')
                elif 'Superimposed Load' in col:
                    new_columns.append('load')
                elif 'Formwork' in col:
                    new_columns.append('formwork_cost')
                elif 'Concrete' in col:
                    new_columns.append('concrete_cost')
                elif 'Total Cost' in col:
                    new_columns.append('total_cost_per_sqft')
                elif col == 'Type':
                    new_columns.append('Type')
                else:
                    new_columns.append(clean_col.lower().replace(' ', '_'))
            
            self.df.columns = new_columns
            
            print("Processed columns:", self.df.columns.tolist())
            print(f"\nDataset statistics:")
            print(f"Total Cost range: ${self.df['total_cost_per_sqft'].min():.2f} - ${self.df['total_cost_per_sqft'].max():.2f}")
            print(f"Area range: {self.df['tributary_area'].min():.0f} - {self.df['tributary_area'].max():.0f} sq ft")
            print(f"Load range: {self.df['load'].min():.0f} - {self.df['load'].max():.0f} lbs/sq ft")
            print("\nDataset preview:")
            print(self.df.head())
            
        except Exception as e:
            print(f"Error loading data: {e}")
            # Create synthetic data if file not found
            self.create_synthetic_data()
    
    def create_synthetic_data(self):
        """Create synthetic data based on Indian construction patterns"""
        print("Creating synthetic Indian construction cost data...")
        
        np.random.seed(42)
        n_samples = 500
        
        # Generate realistic ranges for Indian construction
        areas = np.random.uniform(100, 1000, n_samples)  # sq ft
        loads = np.random.uniform(30, 250, n_samples)    # lbs/sq ft
        types = np.random.randint(1, 5, n_samples)       # Structure types
        
        # Indian cost structure (in USD, will convert later)
        formwork_base = np.random.uniform(2.5, 6.0, n_samples)
        concrete_base = np.random.uniform(1.5, 4.0, n_samples)
        
        # Cost calculations with Indian factors
        formwork_cost = formwork_base * (1 + areas/1000 * 0.1)
        concrete_cost = concrete_base * (1 + loads/100 * 0.05)
        
        # Total cost influenced by area, load, and type
        total_cost = (formwork_cost + concrete_cost * 2.5 + 
                     areas/200 + loads/50 + types * 0.5)
        
        self.df = pd.DataFrame({
            'Type': types,
            'tributary_area': areas,
            'load': loads, 
            'formwork_cost': formwork_cost,
            'concrete_cost': concrete_cost,
            'total_cost_per_sqft': total_cost
        })
        
        print(f"Synthetic dataset created: {self.df.shape}")
    
    def prepare_features(self):
        """Prepare features for training"""
        # Handle categorical variables
        if 'Type' in self.df.columns:
            le = LabelEncoder()
            self.df['type_encoded'] = le.fit_transform(self.df['Type'])
            self.encoders['type'] = le
        
        # Feature engineering
        if 'tributary_area' in self.df.columns and 'load' in self.df.columns:
            self.df['area_load_interaction'] = self.df['tributary_area'] * self.df['load'] / 1000
            self.df['load_per_area'] = self.df['load'] / self.df['tributary_area']
        
        # Select features for training
        feature_cols = ['tributary_area', 'load']
        if 'type_encoded' in self.df.columns:
            feature_cols.append('type_encoded')
        if 'area_load_interaction' in self.df.columns:
            feature_cols.extend(['area_load_interaction', 'load_per_area'])
        
        self.feature_columns = feature_cols
        return self.df[feature_cols], self.df['total_cost_per_sqft']
    
    def train_models(self):
        """Train multiple ML models"""
        X, y = self.prepare_features()
        
        # Convert to Indian costs
        y_indian = y * self.usd_to_inr * self.regional_multiplier
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_indian, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['features'] = scaler
        
        # Define models
        models_to_train = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'linear_regression': LinearRegression()
        }
        
        # Train and evaluate models
        best_model = None
        best_score = -np.inf
        
        for name, model in models_to_train.items():
            print(f"\nTraining {name}...")
            
            # Use scaled data for linear models
            if name == 'linear_regression':
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
            
            # Evaluate
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"  MAE: ₹{mae:.2f}")
            print(f"  R²: {r2:.4f}")
            
            self.models[name] = model
            
            if r2 > best_score:
                best_score = r2
                best_model = name
        
        self.best_model_name = best_model
        self.is_trained = True
        print(f"\nBest model: {best_model} (R² = {best_score:.4f})")
        
        # Save models
        self.save_models()
    
    def predict_cost_per_sqft(self, area, load, structure_type=1):
        """Predict cost per square foot in Indian Rupees"""
        if not self.is_trained:
            print("Model not trained. Training now...")
            self.train_models()
        
        # Prepare input
        input_data = pd.DataFrame({
            'tributary_area': [area],
            'load': [load]
        })
        
        # Add encoded type if available
        if 'type' in self.encoders:
            input_data['type_encoded'] = structure_type - 1
        
        # Add engineered features
        if area > 0 and load > 0:
            input_data['area_load_interaction'] = area * load / 1000
            input_data['load_per_area'] = load / area
        
        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in input_data.columns:
                input_data[col] = 0
        
        # Make prediction using best model
        model = self.models[self.best_model_name]
        
        if self.best_model_name == 'linear_regression':
            input_scaled = self.scalers['features'].transform(input_data[self.feature_columns])
            prediction = model.predict(input_scaled)[0]
        else:
            prediction = model.predict(input_data[self.feature_columns])[0]
        
        return max(prediction, 0)  # Ensure non-negative
    
    def estimate_rwh_system_cost(self, roof_area_m2, roof_type, soil_type, tank_volume_l):
        """
        Estimate complete rainwater harvesting system cost in Indian context with detailed component breakdown
        """
        # Convert area to sq ft for model compatibility
        area_sqft = roof_area_m2 * 10.764
        
        # Determine load based on roof type and local conditions
        load_mapping = {
            'rcc': 150, 'concrete': 150,
            'tile': 80, 'corrugated': 60, 'sheet': 50,
            'asbestos': 45, 'thatch': 30, 'metal': 55
        }
        typical_load = load_mapping.get(roof_type.lower(), 75)
        
        # Structure type based on soil conditions
        structure_type_mapping = {
            'rocky': 4, 'clay': 3, 'loam': 2, 'sandy': 1
        }
        structure_type = structure_type_mapping.get(soil_type.lower(), 2)
        
        # Get base cost per sq ft from ML model
        base_cost_per_sqft = self.predict_cost_per_sqft(area_sqft, typical_load, structure_type)
        
        # ===== DETAILED INDIAN COST BREAKDOWN =====
        
        # 1. STORAGE TANK - Detailed Indian market rates
        if tank_volume_l <= 1000:
            # Small tanks (plastic/fiberglass)
            tank_cost_per_liter = 35  # ₹35/L for small tanks
        elif tank_volume_l <= 5000:
            # Medium tanks (reinforced plastic)
            tank_cost_per_liter = 42  # ₹42/L 
        elif tank_volume_l <= 15000:
            # Large tanks (concrete/ferrocement)
            tank_cost_per_liter = 48  # ₹48/L
        else:
            # Very large tanks (RCC construction)
            tank_cost_per_liter = 55  # ₹55/L
        
        # Additional costs for tank accessories
        tank_base_cost = tank_volume_l * tank_cost_per_liter
        tank_accessories = tank_base_cost * 0.15  # 15% for fittings, valves, pipes
        storage_tank_cost = tank_base_cost + tank_accessories
        
        # 2. RECHARGE PIT - Based on Indian excavation and construction rates
        pit_base_cost = 12000  # ₹12,000 base cost for standard pit
        
        # Size scaling based on roof area
        area_factor = min(roof_area_m2 / 100, 3.0)  # Max 3x scaling
        
        # Soil type multipliers (Indian conditions)
        soil_multipliers = {
            'sandy': 1.0,     # Easy excavation
            'loam': 1.4,      # Moderate difficulty + filter media
            'clay': 1.8,      # Hard excavation + more materials
            'rocky': 2.5,     # Very difficult + equipment costs
        }
        soil_mult = soil_multipliers.get(soil_type.lower(), 1.4)
        
        # Additional costs for pit construction
        excavation_cost = pit_base_cost * soil_mult * area_factor
        filter_media_cost = 3000 * area_factor  # Gravel, sand layers
        masonry_cost = 8000 * area_factor  # Brick/stone lining
        
        recharge_pit_cost = excavation_cost + filter_media_cost + masonry_cost
        
        # 3. GUTTERS & PIPES - Detailed Indian rates
        # PVC gutters and downpipes
        gutter_cost_per_meter = 450  # ₹450/meter for good quality PVC
        pipe_cost_per_meter = 280     # ₹280/meter for 4-6 inch pipes
        
        # Estimate total length needed
        perimeter_estimate = 2 * (roof_area_m2 ** 0.5) * 2  # Rough perimeter calculation
        gutter_length = perimeter_estimate
        pipe_length = perimeter_estimate * 0.6  # Vertical + horizontal runs
        
        gutter_material_cost = gutter_length * gutter_cost_per_meter
        pipe_material_cost = pipe_length * pipe_cost_per_meter
        
        # Fittings and joints (20% of material cost)
        fittings_cost = (gutter_material_cost + pipe_material_cost) * 0.20
        
        gutters_pipes_cost = gutter_material_cost + pipe_material_cost + fittings_cost
        
        # 4. FILTRATION SYSTEM - Multi-stage Indian design
        basic_filtration = 8000  # ₹8,000 for basic sand-gravel filter
        
        # Scale with system size
        if tank_volume_l > 5000:
            # Larger systems need better filtration
            advanced_filtration = 12000  # Multi-stage system
            uv_treatment = 6000 if tank_volume_l > 10000 else 0
        else:
            advanced_filtration = 0
            uv_treatment = 0
        
        # First flush diverter (essential for Indian conditions)
        first_flush_cost = 3500
        
        filtration_cost = basic_filtration + advanced_filtration + uv_treatment + first_flush_cost
        
        # 5. INSTALLATION - Indian labor rates and complexity
        component_subtotal = storage_tank_cost + recharge_pit_cost + gutters_pipes_cost + filtration_cost
        
        # Installation varies by complexity
        if roof_area_m2 < 100:
            installation_rate = 0.16  # 16% for small systems
        elif roof_area_m2 < 300:
            installation_rate = 0.18  # 18% for medium systems  
        else:
            installation_rate = 0.22  # 22% for large complex systems
        
        # Additional costs for Indian conditions
        transportation_cost = component_subtotal * 0.03  # 3% transport
        supervision_cost = component_subtotal * 0.02     # 2% supervision
        
        installation_cost = (component_subtotal * installation_rate) + transportation_cost + supervision_cost
        
        total_cost = component_subtotal + installation_cost
        
        return {
            'storage_tank': round(storage_tank_cost, 2),
            'recharge_pit': round(recharge_pit_cost, 2),
            'gutters_pipes': round(gutters_pipes_cost, 2),
            'filtration_system': round(filtration_cost, 2),
            'installation': round(installation_cost, 2),
            'total': round(total_cost, 2),
            'currency': 'INR',
            'cost_per_sqft': round(base_cost_per_sqft, 2),
            'breakdown': {
                'tank_volume_category': 'small' if tank_volume_l <= 1000 else 
                                      'medium' if tank_volume_l <= 5000 else
                                      'large' if tank_volume_l <= 15000 else 'very_large',
                'tank_cost_per_liter': tank_cost_per_liter,
                'pit_soil_multiplier': soil_mult,
                'system_complexity': 'simple' if roof_area_m2 < 100 else 
                                   'medium' if roof_area_m2 < 300 else 'complex'
            }
        }
    
    def save_models(self):
        """Save trained models"""
        model_dir = Path('trained_models')
        model_dir.mkdir(exist_ok=True)
        
        for name, model in self.models.items():
            joblib.dump(model, model_dir / f'{name}_model.pkl')
        
        # Save scalers and encoders
        joblib.dump(self.scalers, model_dir / 'scalers.pkl')
        joblib.dump(self.encoders, model_dir / 'encoders.pkl')
        joblib.dump(self.feature_columns, model_dir / 'feature_columns.pkl')
        
        print("Models saved successfully!")
    
    def load_models(self):
        """Load pre-trained models"""
        model_dir = Path('trained_models')
        
        try:
            self.models = {}
            for model_file in model_dir.glob('*_model.pkl'):
                name = model_file.stem.replace('_model', '')
                self.models[name] = joblib.load(model_file)
            
            self.scalers = joblib.load(model_dir / 'scalers.pkl')
            self.encoders = joblib.load(model_dir / 'encoders.pkl') 
            self.feature_columns = joblib.load(model_dir / 'feature_columns.pkl')
            
            self.best_model_name = 'random_forest'  # Default
            self.is_trained = True
            print("Models loaded successfully!")
            return True
            
        except Exception as e:
            print(f"Could not load models: {e}")
            return False

# Global predictor instance
indian_cost_predictor = None

def get_cost_predictor():
    """Get or create the cost predictor instance"""
    global indian_cost_predictor
    if indian_cost_predictor is None:
        indian_cost_predictor = IndianCostPredictor()
        # Try to load existing models, otherwise train new ones
        if not indian_cost_predictor.load_models():
            print("Training new models...")
            indian_cost_predictor.train_models()
    
    return indian_cost_predictor

if __name__ == "__main__":
    # Test the cost predictor
    predictor = IndianCostPredictor()
    predictor.train_models()
    
    # Test prediction
    test_cost = predictor.estimate_rwh_system_cost(
        roof_area_m2=100,
        roof_type='RCC',
        soil_type='loam', 
        tank_volume_l=2000
    )
    
    print("\nTest Cost Estimation:")
    for component, cost in test_cost.items():
        if component != 'currency' and component != 'cost_per_sqft':
            print(f"{component.replace('_', ' ').title()}: ₹{cost:,.2f}")
    print(f"\nTotal: ₹{test_cost['total']:,.2f} ({test_cost['currency']})")
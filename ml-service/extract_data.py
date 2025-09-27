import pandas as pd
import os
import json
from pathlib import Path

def extract_states_districts():
    """Extract unique states and districts from CSV files"""
    states_dir = Path("states")
    states_districts = {}
    
    # We'll extract state names directly from the CSV files
    # and use the filename as the state code
    
    for csv_file in states_dir.glob("*.csv"):
        state_code = csv_file.stem
        
        try:
            df = pd.read_csv(csv_file)
            
            # Check if required columns exist
            if 'STATE' not in df.columns or 'DISTRICT' not in df.columns:
                print(f"Warning: Missing required columns in {csv_file}")
                continue
            
            # Get unique state names from the file (should be consistent within file)
            unique_states = df['STATE'].unique()
            if len(unique_states) > 1:
                print(f"Warning: Multiple states found in {csv_file}: {unique_states}")
            
            # Use the first (or only) state name from the file
            state_name = unique_states[0] if len(unique_states) > 0 else state_code
            
            # Get unique districts for this state
            districts = sorted(df['DISTRICT'].unique().tolist())
            
            # Remove any NaN values that might exist
            districts = [d for d in districts if pd.notna(d) and str(d).strip()]
            
            states_districts[state_name] = {
                'code': state_code,
                'districts': districts
            }
            print(f"Processed {state_name} ({state_code}): {len(districts)} districts")
            
            # Print first few districts for verification
            if len(districts) > 0:
                sample_districts = districts[:3] if len(districts) > 3 else districts
                print(f"  Sample districts: {sample_districts}")
            
        except Exception as e:
            print(f"Error processing {csv_file}: {e}")
    
    return states_districts

def create_groundwater_model():
    """Create a simple groundwater prediction model"""
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import LabelEncoder
    import pickle
    
    # Combine all CSV files
    all_data = []
    states_dir = Path("states")
    
    print("Reading CSV files for model training...")
    for csv_file in states_dir.glob("*.csv"):
        try:
            df = pd.read_csv(csv_file)
            
            # Check if required columns exist
            required_cols = ['STATE', 'DISTRICT', 'BLOCK_NAME', 'LAT', 'LON', 'YEAR_OBS', 'Season', 'Depth']
            missing_cols = [col for col in required_cols if col not in df.columns]
            
            if missing_cols:
                print(f"Skipping {csv_file}: Missing columns {missing_cols}")
                continue
            
            # Filter out rows with missing critical data
            df_clean = df.dropna(subset=['STATE', 'DISTRICT', 'LAT', 'LON', 'Depth'])
            
            if len(df_clean) == 0:
                print(f"Skipping {csv_file}: No valid data after cleaning")
                continue
            
            # Get latest year data for each location to avoid temporal duplicates
            latest_data = df_clean.groupby(['STATE', 'DISTRICT', 'BLOCK_NAME'], as_index=False).apply(
                lambda x: x.loc[x['YEAR_OBS'].idxmax()], include_groups=False
            ).reset_index(drop=True)
            
            all_data.append(latest_data)
            print(f"Added {len(latest_data)} samples from {csv_file.name}")
            
        except Exception as e:
            print(f"Error reading {csv_file}: {e}")
    
    if not all_data:
        print("No data found!")
        return None
    
    combined_df = pd.concat(all_data, ignore_index=True)
    print(f"Combined dataset has {len(combined_df)} samples")
    
    # Prepare features
    le_state = LabelEncoder()
    le_district = LabelEncoder()
    le_season = LabelEncoder()
    
    # Handle missing values in categorical columns
    combined_df['STATE'] = combined_df['STATE'].fillna('UNKNOWN')
    combined_df['DISTRICT'] = combined_df['DISTRICT'].fillna('UNKNOWN')
    combined_df['Season'] = combined_df['Season'].fillna('UNKNOWN')
    
    combined_df['STATE_ENCODED'] = le_state.fit_transform(combined_df['STATE'])
    combined_df['DISTRICT_ENCODED'] = le_district.fit_transform(combined_df['DISTRICT'])
    combined_df['SEASON_ENCODED'] = le_season.fit_transform(combined_df['Season'])
    
    # Features for prediction
    features = ['STATE_ENCODED', 'DISTRICT_ENCODED', 'SEASON_ENCODED', 'LAT', 'LON', 'YEAR_OBS']
    X = combined_df[features].fillna(0)
    y = combined_df['Depth'].fillna(combined_df['Depth'].mean())
    
    print(f"Training model with features: {features}")
    print(f"Target variable (Depth) range: {y.min():.2f} - {y.max():.2f} meters")
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)
    
    # Calculate model performance
    from sklearn.metrics import mean_absolute_error, r2_score
    y_pred = model.predict(X)
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    
    print(f"Model Performance:")
    print(f"  Mean Absolute Error: {mae:.2f} meters")
    print(f"  R² Score: {r2:.3f}")
    
    # Save model and encoders
    model_data = {
        'model': model,
        'le_state': le_state,
        'le_district': le_district, 
        'le_season': le_season,
        'feature_names': features,
        'training_stats': {
            'samples': len(combined_df),
            'mae': mae,
            'r2_score': r2,
            'depth_range': [float(y.min()), float(y.max())],
            'states_count': len(le_state.classes_),
            'districts_count': len(le_district.classes_)
        }
    }
    
    with open('groundwater_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"Model trained with {len(combined_df)} samples")
    print(f"Unique states: {len(le_state.classes_)}")
    print(f"Unique districts: {len(le_district.classes_)}")
    
    return model_data

if __name__ == "__main__":
    # Extract states and districts
    states_districts = extract_states_districts()
    
    # Save to JSON file
    with open('states_districts.json', 'w') as f:
        json.dump(states_districts, f, indent=2)
    
    print(f"\nExtracted {len(states_districts)} states")
    
    # Create ML model
    print("\nTraining groundwater prediction model...")
    model_data = create_groundwater_model()
    
    if model_data:
        print("Model saved as groundwater_model.pkl")
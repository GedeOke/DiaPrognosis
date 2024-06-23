from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model_scaler = joblib.load('model_and_scaler.pkl')
model = model_scaler['model']
scaler = model_scaler['scaler']

reference_data = pd.read_csv('diabetes_prediction_dataset.csv')
reference_data['smoking_history'].replace(
    {'never': 2, 'No Info': 3, 'current': 4, 'former': 5, 'not current': 6, 'ever': 7}, inplace=True)
reference_data['gender'].replace({'Male': 2, 'Female': 3, 'Other': 3}, inplace=True)

features = ['gender', 'age', 'hypertension', 'heart_disease', 'smoking_history', 'bmi', 'HbA1c_level', 'blood_glucose_level']

class DiabetesInput(BaseModel):
    gender: int
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: int
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float

@app.post("/predict")
def predict_diabetes(input_data: DiabetesInput):
    input_df = pd.DataFrame([{
        'gender': input_data.gender,
        'age': input_data.age,
        'hypertension': input_data.hypertension,
        'heart_disease': input_data.heart_disease,
        'smoking_history': input_data.smoking_history,
        'bmi': input_data.bmi,
        'HbA1c_level': input_data.HbA1c_level,
        'blood_glucose_level': input_data.blood_glucose_level
    }], columns=features)

    scaled_data = scaler.transform(input_df)

    prediction = model.predict(scaled_data)
    if prediction[0] == 0:
        return {"prediction": "Tidak menderita diabetes"}
    else:
        return {"prediction": "Menderita diabetes"}
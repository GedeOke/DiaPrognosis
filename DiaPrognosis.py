import os
from flask import Flask, render_template, request, jsonify, session
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import requests
import warnings
from groq import Groq
from database.database import init_db, insert_message, get_all_messages

warnings.filterwarnings('ignore')

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Secret key for session management

# Initialize database for chat history
init_db()

# Load dataset
data = pd.read_csv('Data/diabetes_prediction_dataset.csv')

# Replace values in 'smoking_history' and 'gender' columns
data['smoking_history'].replace({'never': 2, 'No Info': 3, 'current': 4, 'former': 5,
                                'not current': 6, 'ever': 7}, inplace=True)
data['gender'].replace({'Male': 2, 'Female': 3, 'Other': 3}, inplace=True)

# Feature Scaling Using StandardScaler
scaler = StandardScaler()
scaler.fit(data.drop('diabetes', axis=1))

# Setup Groq client
GROQ_API_KEY = "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"
client = Groq(api_key=GROQ_API_KEY)

# Define route for home page
@app.route('/')
def home():
    return render_template('index.html')

# Define route for chat page
@app.route('/chat')
def chat():
    return render_template('chatV2.html')

# Define route for chat response
@app.route('/chat-response', methods=['POST'])
def chat_response():
    if request.method == 'POST':
        user_message = request.form['message']
        if 'conversation' not in session:
            session['conversation'] = []

        # Add the user message to the conversation history
        session['conversation'].append(
            {"role": "user", "content": user_message})
        
        # Store the user message in the database
        insert_message('User', user_message)

        session['conversation'].insert(0, {
            "role": "system",
            "content": (
                "Kamu adalah DiaPrognosis dengan panggilan Dian, chatbot konsultan diabetes wanita yang gaul sekali dan suka "
                "menggunakan emoticons, serta hanya ingin merespon percakapan tentang diabetes saja, diluar topik diabetes kamu "
                "tidak suka."
            )
        })
        
        # Set language to Indonesian
        session['conversation'].insert(1, {
            "role": "system",
            "content": "Gunakan bahasa Indonesia untuk semua percakapan."
        })
        
        # Dokter
        session['conversation'].insert(2, {
            "role": "system",
            "content": "Jika menanyakan rekomendasi dokter, berikan nama dokternya dan alamat rumah sakitnya dengan dummy data."
        })

        # Call Groq API for chat response
        chat_completion = client.chat.completions.create(
            messages=session['conversation'],
            model="llama3-8b-8192",
        )

        bot_response = chat_completion.choices[0].message.content

        # Add the bot response to the conversation history
        session['conversation'].append(
            {"role": "assistant", "content": bot_response})

        # Remove the role definition after the first message
        session['conversation'] = session['conversation'][1:]

        # Store the bot response in the database
        insert_message('Diaprognosis', bot_response)

        return jsonify(response=bot_response)

# Define route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        # Get form data
        age = float(request.form['age'])
        bmi = float(request.form['bmi'])
        hypertension = int(request.form['hypertension'])
        heart_disease = int(request.form['heart_disease'])
        smoking_history = int(request.form['smoking_history'])
        blood_glucose_level = float(request.form['blood_glucose_level'])
        HbA1c_level = float(request.form['HbA1c_level'])
        gender = int(request.form['gender'])

        # Feature Scaling
        input_data = np.array([[age, bmi, hypertension, heart_disease, smoking_history,
                                blood_glucose_level, HbA1c_level, gender]])
        scaled_input = scaler.transform(input_data)

        # Prepare payload for scoring
        payload_scoring = {
            "input_data": [
                {
                    "fields": ['age', 'bmi', 'hypertension', 'heart_disease', 'smoking_history',
                               'blood_glucose_level', 'HbA1c_level', 'gender'],
                    "values": scaled_input.tolist()
                }
            ]
        }

        API_KEY = "z8WrJu92peRLlQCeE3a32S-b1nu7Wk_7OljysvmLIb4i"
        token_response = requests.post('https://iam.cloud.ibm.com/identity/token', data={
                                       "apikey": API_KEY, "grant_type": 'urn:ibm:params:oauth:grant-type:apikey'})
        mltoken = token_response.json()["access_token"]

        response_scoring = requests.post(
            'https://us-south.ml.cloud.ibm.com/ml/v4/deployments/a1b17c39-babf-4999-b3d9-57d13c34ee2d/predictions?version=2021-05-01',
            json=payload_scoring,
            headers={'Authorization': 'Bearer ' + mltoken}
        )

        try:
            prediction = response_scoring.json()['predictions'][0]['values'][0][0]

            # Interpret prediction
            if prediction == 0:
                result = 'Tidak menderita diabetes'
            else:
                result = 'Menderita diabetes'

        except KeyError as e:
            # Handle missing 'predictions' key
            print(f"KeyError: {e}")
            result = 'Error: Prediksi tidak berhasil, silakan coba lagi.'

        # Store the form inputs and the prediction result in the database
        insert_message('User', f"Form Input: Age={age}, BMI={bmi}, Hypertension={hypertension}, Heart Disease={heart_disease}, Smoking History={smoking_history}, Blood Glucose Level={blood_glucose_level}, HbA1c Level={HbA1c_level}, Gender={gender}")
        insert_message('Diaprognosis', f"Prediction Result: {result}")

        return jsonify(prediction=result)

@app.route('/chat-history', methods=['GET', 'POST'])
def chat_history():
    if request.method == 'POST':
        keyword = request.form.get('keyword', '').lower()
        messages = get_all_messages()
        if keyword:
            messages = [message for message in messages if keyword in message[2].lower()]
    else:
        messages = get_all_messages()
    return render_template('chat_history.html', messages=messages)

if __name__ == '__main__':
    app.run(debug=True)
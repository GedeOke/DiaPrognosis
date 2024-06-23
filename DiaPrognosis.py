from functools import wraps
import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import requests
from groq import Groq
from database.db import init_db, insert_message, get_messages_by_user, insert_user, get_user

import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
app.secret_key = os.urandom(24)

data = pd.read_csv('Data/diabetes_prediction_dataset.csv')

data['smoking_history'].replace(
    {'never': 2, 'No Info': 3, 'current': 4, 'former': 5, 'not current': 6, 'ever': 7}, inplace=True)
data['gender'].replace({'Male': 2, 'Female': 3, 'Other': 3}, inplace=True)

scaler = StandardScaler()
scaler.fit(data.drop('diabetes', axis=1))

GROQ_API_KEY = "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"
client = Groq(api_key=GROQ_API_KEY)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def base():
    return render_template('home.html')

@app.route('/home')
@login_required
def home():
    return render_template('home.html')

@app.route('/chat')
@login_required
def chat():
    return render_template('chatroom.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(
            password, method='pbkdf2:sha256')

        insert_user(username, hashed_password)
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = get_user(username)

        if user and check_password_hash(user[2], password):
            session['username'] = username
            next_page = request.args.get('next')
            return redirect(next_page or url_for('home'))
        else:
            flash('Login failed. Check your username and/or password.', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

def format_message(message):
    formatted_message = message.replace('\n', '<br>')
    return formatted_message

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    if request.method == 'POST':
        age = float(request.form['age'])
        bmi = float(request.form['bmi'])
        hypertension = int(request.form['hypertension'])
        heart_disease = int(request.form['heart_disease'])
        smoking_history = int(request.form['smoking_history'])
        blood_glucose_level = float(request.form['blood_glucose_level'])
        HbA1c_level = float(request.form['HbA1c_level'])
        gender = int(request.form['gender'])
        
        input_data = np.array([[age, bmi, hypertension, heart_disease, smoking_history, blood_glucose_level, HbA1c_level, gender]])
        scaled_input = scaler.transform(input_data)
        
        payload_scoring = {
            "input_data": [
                {
                    "fields": ['age', 'bmi', 'hypertension', 'heart_disease', 'smoking_history', 'blood_glucose_level', 'HbA1c_level', 'gender'],
                    "values": scaled_input.tolist()
                }
            ]
        }
        
        API_KEY = "z8WrJu92peRLlQCeE3a32S-b1nu7Wk_7OljysvmLIb4i"
        token_response = requests.post('https://iam.cloud.ibm.com/identity/token', data={"apikey": API_KEY, "grant_type": 'urn:ibm:params:oauth:grant-type:apikey'})
        mltoken = token_response.json()["access_token"]
        
        response_scoring = requests.post(
            'https://us-south.ml.cloud.ibm.com/ml/v4/deployments/a1b17c39-babf-4999-b3d9-57d13c34ee2d/predictions?version=2021-05-01',
            json=payload_scoring,
            headers={'Authorization': 'Bearer ' + mltoken}
        )
        
        try:
            prediction = response_scoring.json()['predictions'][0]['values'][0][0]
            result = 'Menderita diabetes' if prediction == 1 else 'Tidak menderita diabetes'
        except KeyError as e:
            result = 'Error: Prediksi tidak berhasil, silakan coba lagi.'
        
        session['last_input'] = {
            'age': age, 'bmi': bmi, 'hypertension': hypertension, 'heart_disease': heart_disease,
            'smoking_history': smoking_history, 'blood_glucose_level': blood_glucose_level, 
            'HbA1c_level': HbA1c_level, 'gender': gender, 'prediction': result
        }

        username = session.get('username', 'User')
        formatted_input = format_message(f"Form Input:<br>Age={age}<br>BMI={bmi}<br>Hypertension={hypertension}<br>Heart Disease={heart_disease}<br>Smoking History={smoking_history}<br>Blood Glucose Level={blood_glucose_level}<br>HbA1c Level={HbA1c_level}<br>Gender={gender}")
        insert_message(username, formatted_input, 'Dian')
        insert_message('Dian', f"Prediction Result: {result}", 'Dian')
        
        session['prediction_result'] = result
        session['result_position'] = len(get_messages_by_user(username)) 
        
        return jsonify(prediction=result)

@app.route('/chat-response', methods=['POST'])
@login_required
def chat_response():
    if request.method == 'POST':
        user_message = request.form['message']
        username = session.get('username', 'User')
        
        if 'conversation' not in session:
            session['conversation'] = []
        
        session['conversation'].append({"role": "user", "content": user_message})
        insert_message(username, user_message, 'user')
        
        if len(session['conversation']) == 1:
            session['conversation'].insert(0, {"role": "system", "content": (
                "Kamu adalah DiaPrognosis dengan panggilan Dian, chatDian konsultan diabetes yang gaul sekali dan suka menggunakan emoticons.")})
            session['conversation'].insert(1, {"role": "system", "content": "Hanya menanggapi percakapan tentang Diabetes. TIDAK MENJAWAB ATAU MENANGGAPI PERCAKAPAN SELAIN DIABETES."})
            session['conversation'].insert(2, {"role": "system", "content": "Bahasa kamu hanya bahasa Indonesia. Tidak menanggapi percakapan dengan bahasa selain Indonesia."})
            session['conversation'].insert(3, {"role": "system", "content": "Jika menanyakan rekomendasi dokter, berikan nama dokternya dan alamat rumah sakitnya dengan dummy data."})

        if 'last_input' in session:
            session['conversation'].append({
                "role": "system", 
                "content": f"Data terakhir: {session['last_input']}"
            })

        chat_completion = client.chat.completions.create(
            messages=session['conversation'],
            model="llama3-70b-8192",
        )

        Dian_response = chat_completion.choices[0].message.content
        session['conversation'].append({"role": "assistant", "content": Dian_response})
        insert_message(username, Dian_response, 'Dian')
        return jsonify(response=Dian_response)

@app.route('/chat-history', methods=['GET', 'POST'])
@login_required
def chat_history():
    username = session['username']
    if request.method == 'POST':
        keyword = request.form.get('keyword', '').lower()
        messages = get_messages_by_user(username)
        if keyword:
            messages = [
                message for message in messages if keyword in message[2].lower()]
    else:
        messages = get_messages_by_user(username)
    return render_template('chat_history.html', messages=messages)

@app.route('/get-username')
def get_username():
    if 'username' in session:
        return jsonify(username=session['username'])
    else:
        return jsonify(username=None), 401

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
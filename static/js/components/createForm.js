export function createForm(messagesDiv) {
    const formDiv = document.createElement('div');
    formDiv.className = 'diabetesForm';
    formDiv.innerHTML = `
        <form class="space-y-4">
            <div>
                <label for="gender" class="block">Jenis Kelamin:</label>
                <select name="gender">
                    <option value="2">Laki-laki</option>
                    <option value="3">Perempuan</option>
                    <option value="3">Lainnya</option>
                </select>
            </div>

            <div>
                <label for="age" class="block">Usia:</label>
                <input type="number" name="age" placeholder="Masukkan usia">
            </div>

            <div>
                <label for="hypertension" class="block">Hipertensi (1 = Ya, 0 = Tidak):</label>
                <select name="hypertension">
                    <option value="1">Ya</option>
                    <option value="0">Tidak</option>
                </select>
            </div>

            <div>
                <label for="heart_disease" class="block">Penyakit Jantung (1 = Ya, 0 = Tidak):</label>
                <select name="heart_disease">
                    <option value="1">Ya</option>
                    <option value="0">Tidak</option>
                </select>
            </div>

            <div>
                <label for="smoking_history" class="block">Riwayat Merokok:</label>
                <select name="smoking_history">
                    <option value="2">Tidak Pernah</option>
                    <option value="3">Tidak Ada Informasi</option>
                    <option value="4">Saat Ini</option>
                    <option value="5">Dulu</option>
                    <option value="6">Tidak Lagi</option>
                    <option value="7">Pernah</option>
                </select>
            </div>

            <div>
                <label for="bmi" class="block">Indeks Massa Tubuh (BMI):</label>
                <input type="number" name="bmi" step="0.01" placeholder="Masukkan BMI">
            </div>

            <div>
                <label for="HbA1c_level" class="block">Tingkat HbA1c:</label>
                <input type="number" name="HbA1c_level" step="0.01" placeholder="Masukkan Tingkat HbA1c">
            </div>

            <div>
                <label for="blood_glucose_level" class="block">Tingkat Glukosa Darah (mg/dL):</label>
                <input type="number" name="blood_glucose_level" step="0.01" placeholder="Masukkan Tingkat Glukosa Darah">
            </div>

            <div class="flex justify-between">
                <button type="button" class="submitForm">Prediksi</button>
            </div>
        </form>
    `;
    messagesDiv.appendChild(formDiv);
    const submitButton = formDiv.querySelector('.submitForm');
    submitButton.addEventListener('click', submitForm);
}

async function submitForm(event) {
    const form = event.target.closest('form');
    const formData = new FormData(form);

    // Menampilkan pesan loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message left';
    loadingDiv.innerHTML = `
        <div class="name">Chatbot</div>
        <div class="bubble">Sedang memproses...</div>
    `;
    document.getElementById('messages').appendChild(loadingDiv);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        // Menghapus pesan loading
        document.getElementById('messages').removeChild(loadingDiv);

        // Menampilkan hasil prediksi
        const resultDiv = document.createElement('div');
        resultDiv.className = 'message left';
        resultDiv.innerHTML = `
            <div class="name">Chatbot</div>
            <div class="bubble">Hasil prediksi: ${result.prediction}</div>
        `;
        document.getElementById('messages').appendChild(resultDiv);
        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }
}
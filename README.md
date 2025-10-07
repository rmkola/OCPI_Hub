# OCPI Hub TR

**OCPI Hub TR**, [OCPI 2.3.0](https://evroaming.org/ocpi/) standardına göre **CPO (Charge Point Operator)** ve **eMSP (e-Mobility Service Provider)** rollerini merkezi bir noktada haberleşmesini sağlayan açık kaynaklı bir hub uygulamasıdır.  

Proje iki bileşenden oluşur:
- **Backend (Python)** → OCPI protokolüne uygun API servisleri
- **Frontend (JavaScript / HTML / CSS)** → Hub yönetim arayüzü
- **Tests** → Backend test senaryoları (`backend_test.py`, `backend_test_authenticated.py`)

MIT lisansı ile özgürce kullanılabilir.

---

## Özellikler

- OCPI 2.3.0 protokolüne uygun API
- CPO ↔ eMSP haberleşmesi için merkezi hub
- Kullanıcı dostu frontend arayüzü
- Python backend, Node.js tabanlı frontend
- Test dosyaları ile temel senaryo kontrolleri

---

## Proje Yapısı

OCPI_Hub_TR/  
├── backend/ # Python backend  
│ ├── app.py  
│ ├── requirements.txt  
│ └── ...  
├── frontend/ # JavaScript frontend  
│ ├── package.json  
│ ├── src/  
│ └── public/  
├── tests/ # Test dosyaları  
├── backend_test.py  
├── backend_test_authenticated.py  
├── test_result.md # Test çıktıları  
├── .gitignore  
└── LICENSE  

yaml
Kodu kopyala

---

## Kurulum & Çalıştırma

### 1. Backend (Python)

```bash
cd backend

# Sanal ortam oluştur
python -m venv venv
source venv/bin/activate   # Linux / macOS
venv\Scripts\activate      # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt

# Backend'i çalıştır
python app.py
```
Backend varsayılan olarak http://localhost:8000 adresinde çalışır.

### 2. Frontend (JavaScript)
```bash
Kodu kopyala
cd frontend

# Bağımlılıkları yükle
npm install

# Frontend çalıştır
npm start
```
Frontend varsayılan olarak http://localhost:3000 adresinde açılır ve backend API’ye bağlanır.


### 3. Testler
Projede iki temel test dosyası bulunur:

```bash
Kodu kopyala
# Kimlik doğrulamasız test
python backend_test.py

# Kimlik doğrulamalı test
python backend_test_authenticated.py
```
Test sonuçları test_result.md dosyasında saklanabilir.

### Kullanım
* Önce backend’i (python app.py) çalıştırın.
* Ardından frontend’i (npm start) başlatın.
* Tarayıcıdan http://localhost:3000 adresine giderek hub arayüzüne erişin.
* Buradan CPO ve eMSP sistemlerini hub’a kaydedebilir ve haberleşmeyi yönetebilirsiniz.

### Yol Haritası
- Docker Compose desteği (backend + frontend birlikte)
- Swagger / OpenAPI dokümantasyonu
- Frontend’de gelişmiş yönetim ekranları
- Daha kapsamlı test senaryoları
- Loglama ve monitoring desteği

### Katkıda Bulunma
Katkılarınızı bekliyoruz!
- Repo’yu fork edin
- Yeni bir branch açın (git checkout -b feature/özellik)
- Değişikliklerinizi yapın ve commit edin
- Branch’i push edin (git push origin feature/özellik)
- Pull Request açın

### Lisans
Bu proje MIT Lisansı ile lisanslanmıştır.

### İletişim
Geliştirici: Ramazan Kola  
GitHub: @rmkola

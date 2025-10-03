import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    cpos: 0,
    emsps: 0,
    locations: 0,
    sessions: 0
  });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, orgsResponse] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/organizations`)
      ]);
      
      setStats(statsResponse.data);
      setOrganizations(orgsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
        <h1 className="text-4xl font-bold mb-4">OCPI 2.3.0 Hub</h1>
        <p className="text-xl opacity-90">Elektrikli Araç Şarj Ağı Roaming Hub'ı</p>
        <p className="text-lg mt-2 opacity-80">
          CPO'lar ve eMSP'ler için merkezi bağlantı noktası
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">CPO'lar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cpos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚗</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">eMSP'ler</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emsps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">Şarj Lokasyonları</p>
              <p className="text-2xl font-bold text-gray-900">{stats.locations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">Aktif Oturumlar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Kayıtlı Organizasyonlar</h2>
            <Link 
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Yeni Kayıt
            </Link>
          </div>
        </div>
        <div className="p-6">
          {organizations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz kayıtlı organizasyon yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Organizasyon</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ülke</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Party ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            org.role === 'CPO' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <span className="font-medium">{org.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          org.role === 'CPO' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {org.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{org.country_code}</td>
                      <td className="py-3 px-4 font-mono">{org.party_id}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(org.created_at).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Registration Component
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    country_code: 'TR',
    party_id: '',
    role: 'CPO'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API}/organizations/register`, formData);
      setSuccess('Organizasyon başarıyla kaydedildi!');
      
      // Show API token to user
      alert(`Kayıt başarılı!\n\nOrganizasyon ID: ${response.data.id}\n\nLütfen API token'ınızı güvenli bir yerde saklayın.`);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizasyon Kaydı</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizasyon Adı *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Türkiye Elektrik A.Ş."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Web Sitesi
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ülke Kodu *
              </label>
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TR">TR - Türkiye</option>
                <option value="DE">DE - Almanya</option>
                <option value="FR">FR - Fransa</option>
                <option value="NL">NL - Hollanda</option>
                <option value="GB">GB - İngiltere</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party ID * (3 karakter)
              </label>
              <input
                type="text"
                name="party_id"
                value={formData.party_id}
                onChange={handleChange}
                required
                maxLength={3}
                minLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizasyon Rolü *
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="CPO"
                  checked={formData.role === 'CPO'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">CPO (Charge Point Operator)</div>
                  <div className="text-sm text-gray-600">Şarj istasyonlarını işleten organizasyon</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="EMSP"
                  checked={formData.role === 'EMSP'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">eMSP (e-Mobility Service Provider)</div>
                  <div className="text-sm text-gray-600">Elektrikli araç kullanıcılarına hizmet veren organizasyon</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydol'}
            </button>
            <Link
              to="/"
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 text-center transition"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// API Documentation Component
const ApiDocs = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">OCPI 2.3.0 API Dokümantasyonu</h2>
        
        {/* Authentication Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Kimlik Doğrulama</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-3">
              Tüm OCPI API çağrıları, HTTP Authorization header'ında bearer token gerektirir:
            </p>
            <code className="bg-gray-800 text-green-400 p-2 rounded block">
              Authorization: Token YOUR_API_TOKEN
            </code>
          </div>
        </div>

        {/* Endpoints Section */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">OCPI Endpoints</h3>
            
            {/* Credentials */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-lg text-blue-600 mb-2">Credentials Module</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">GET</span>
                  <code>/api/ocpi/2.3.0/credentials</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">POST</span>
                  <code>/api/ocpi/2.3.0/credentials</code>
                </div>
                <p className="text-gray-600 text-sm">Kimlik doğrulama token'larını değişir</p>
              </div>
            </div>

            {/* Locations */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-lg text-blue-600 mb-2">Locations Module</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">GET</span>
                  <code>/api/ocpi/2.3.0/locations</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">POST</span>
                  <code>/api/ocpi/2.3.0/locations</code>
                </div>
                <p className="text-gray-600 text-sm">Şarj istasyonu lokasyonlarını yönetir</p>
              </div>
            </div>

            {/* Sessions */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-lg text-blue-600 mb-2">Sessions Module</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">GET</span>
                  <code>/api/ocpi/2.3.0/sessions</code>
                </div>
                <p className="text-gray-600 text-sm">Şarj oturumlarını listeler</p>
              </div>
            </div>

            {/* Tokens */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-lg text-blue-600 mb-2">Tokens Module</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">GET</span>
                  <code>/api/ocpi/2.3.0/tokens</code>
                </div>
                <p className="text-gray-600 text-sm">RFID ve uygulama token'larını yönetir (sadece eMSP'ler)</p>
              </div>
            </div>
          </div>

          {/* Management Endpoints */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Yönetim Endpoints</h3>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-lg text-purple-600 mb-2">Organization Management</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">POST</span>
                  <code>/api/organizations/register</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">GET</span>
                  <code>/api/organizations</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">GET</span>
                  <code>/api/dashboard/stats</code>
                </div>
                <p className="text-gray-600 text-sm">Organizasyon kaydı ve yönetimi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Request */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Örnek İstek</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre>{`curl -X GET "${BACKEND_URL}/api/ocpi/2.3.0/locations" \
  -H "Authorization: Token YOUR_API_TOKEN" \
  -H "Content-Type: application/json"`}</pre>
          </div>
        </div>

        {/* Response Format */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Yanıt Formatı</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre>{`{
  "data": [...],
  "status_code": 1000,
  "status_message": "Success",
  "timestamp": "2025-01-16T10:30:00Z"
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-gray-900">OCPI Hub</span>
          </Link>
          
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Dashboard
            </Link>
            <Link 
              to="/register" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Kayıt
            </Link>
            <Link 
              to="/docs" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              API Docs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/docs" element={<ApiDocs />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;

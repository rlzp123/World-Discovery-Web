const resultDiv = document.getElementById('result');

// Inicializar mapa
const map = L.map('map').setView([0, 0], 2);

// Camada do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let currentMarker = null; // marcador atual

// Função para mostrar resultado e adicionar marcador
async function showResult(name, lat, lon) {
    resultDiv.innerHTML = `
        <h2>${name}</h2>
        <p>Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}</p>
    `;

    // Remove marcador anterior
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Adiciona novo marcador
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${name}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
        .openPopup();

    // Centraliza e dá zoom no marcador
    map.setView([lat, lon], 6);
}

// Reverse geocoding para obter país/cidade
async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    const data = await response.json();
    const name = data.address.city || data.address.town || data.address.village 
                 || data.address.state || data.address.country || "Localização desconhecida";
    return name;
}

// Evento de clique no mapa
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    const name = await reverseGeocode(lat, lng);
    showResult(name, lat, lng);
});

// Geolocalização do usuário
const btnLocation = document.getElementById('getLocation');
btnLocation.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const name = await reverseGeocode(latitude, longitude);
            showResult(name, latitude, longitude);
        }, (err) => {
            resultDiv.innerHTML = "Não foi possível obter a localização.";
            console.error(err);
        });
    } else {
        resultDiv.innerHTML = "Geolocalização não suportada.";
    }
});
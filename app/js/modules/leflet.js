/* global L:readonly */
const map = L.map('contacts')
  .setView({
    lat: 59.929441, 
    lng: 30.391617,
  }, 15);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
).addTo(map);

const marker = L.marker(
  {
    
    lat: 59.929406,
    lng: 30.399590,
  },
);

marker.addTo(map)
.bindPopup('Малоохтинский проспект, 61')
.openPopup();



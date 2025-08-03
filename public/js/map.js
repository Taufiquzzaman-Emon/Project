document.addEventListener('DOMContentLoaded', () => {
  const coordinates = window.listingCoordinates;
  const apiKey = window.maptilerApiKey;
  const locationText = window.listingLocation;

  const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
    center: coordinates,
    zoom: 12
  });

  // Create a custom Airbnb-style red marker
  const el = document.createElement('div');
  el.className = 'custom-marker';

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat(coordinates)
    .addTo(map);

  // Create popup
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
  }).setText(locationText);

  // Show popup on hover
  marker.getElement().addEventListener('mouseenter', () => {
    popup.setLngLat(marker.getLngLat()).addTo(map);
  });

  marker.getElement().addEventListener('mouseleave', () => {
    popup.remove();
  });

  // Update marker position during geocode
  window.geocode = function () {
    const address = document.getElementById("address").value;
    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length === 0) {
          alert("Location not found");
          return;
        }

        const [lon, lat] = data.features[0].center;

        map.flyTo({ center: [lon, lat], zoom: 14 });
        marker.setLngLat([lon, lat]); // 🟢 Move the existing marker instead of creating a new one
      })
      .catch((err) => {
        console.error("Geocoding error:", err);
        alert("Something went wrong.");
      });
  };
});

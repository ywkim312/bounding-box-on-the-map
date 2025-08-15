// Initialize MapLibre map
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // Clean, detailed map style
    center: [-98.5795, 39.8283], // Center of United States
    zoom: 4, // Zoom level to show most of the US
    maxZoom: 18,
    minZoom: 2
});

// Variables for bounding box functionality
let isDrawing = false;
let startPoint = null;
let boundingBoxSource = null;
let boundingBoxLayer = null;

// DOM elements
const boundingBoxToggle = document.getElementById('boundingBoxToggle');
const coordinatesDiv = document.getElementById('coordinates');
const coordinateList = document.getElementById('coordinateList');
const apiStatusDiv = document.getElementById('apiStatus');
const apiStatusText = document.getElementById('apiStatusText');

// Initialize the map
map.on('load', function() {
    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl());
    
    // Add scale control
    map.addControl(new maplibregl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    }));
    
    // Add fullscreen control
    map.addControl(new maplibregl.FullscreenControl());
    
    // Add geolocate control
    map.addControl(new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));
});

// Handle bounding box toggle
boundingBoxToggle.addEventListener('change', function() {
    if (this.checked) {
        enableBoundingBoxDrawing();
    } else {
        disableBoundingBoxDrawing();
    }
});

function enableBoundingBoxDrawing() {
    map.getCanvas().style.cursor = 'crosshair';
    
    // Add event listeners for drawing
    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
    
    // Add touch support for mobile devices
    map.on('touchstart', onTouchStart);
    map.on('touchmove', onTouchMove);
    map.on('touchend', onTouchEnd);
}

function disableBoundingBoxDrawing() {
    map.getCanvas().style.cursor = '';
    
    // Remove event listeners
    map.off('mousedown', onMouseDown);
    map.off('mousemove', onMouseMove);
    map.off('mouseup', onMouseUp);
    map.off('touchstart', onTouchStart);
    map.off('touchmove', onTouchMove);
    map.off('touchend', onTouchEnd);
    
    // Clear any existing bounding box
    clearBoundingBox();
}

function onMouseDown(e) {
    if (!boundingBoxToggle.checked) return;
    
    isDrawing = true;
    startPoint = e.lngLat;
    
    // Prevent default behavior
    e.preventDefault();
}

function onMouseMove(e) {
    if (!isDrawing || !startPoint) return;
    
    const currentPoint = e.lngLat;
    drawBoundingBox(startPoint, currentPoint);
}

function onMouseUp(e) {
    if (!isDrawing || !startPoint) return;
    
    isDrawing = false;
    const endPoint = e.lngLat;
    
    // Only create bounding box if there's meaningful distance
    const distance = Math.sqrt(
        Math.pow(endPoint.lng - startPoint.lng, 2) + 
        Math.pow(endPoint.lat - startPoint.lat, 2)
    );
    
    if (distance > 0.001) { // Minimum distance threshold
        finalizeBoundingBox(startPoint, endPoint);
    } else {
        clearBoundingBox();
    }
    
    startPoint = null;
}

// Touch event handlers for mobile devices
function onTouchStart(e) {
    if (!boundingBoxToggle.checked) return;
    
    isDrawing = true;
    startPoint = e.lngLats[0];
    e.preventDefault();
}

function onTouchMove(e) {
    if (!isDrawing || !startPoint) return;
    
    const currentPoint = e.lngLats[0];
    drawBoundingBox(startPoint, currentPoint);
    e.preventDefault();
}

function onTouchEnd(e) {
    if (!isDrawing || !startPoint) return;
    
    isDrawing = false;
    const endPoint = e.lngLats[0];
    
    const distance = Math.sqrt(
        Math.pow(endPoint.lng - startPoint.lng, 2) + 
        Math.pow(endPoint.lat - startPoint.lat, 2)
    );
    
    if (distance > 0.001) {
        finalizeBoundingBox(startPoint, endPoint);
    } else {
        clearBoundingBox();
    }
    
    startPoint = null;
    e.preventDefault();
}

function drawBoundingBox(start, end) {
    console.log('Drawing bounding box from', start, 'to', end);
    
    const coordinates = [
        [start.lng, start.lat],
        [end.lng, start.lat],
        [end.lng, end.lat],
        [start.lng, end.lat],
        [start.lng, start.lat] // Close the polygon
    ];
    
    // Remove existing bounding box source and layer
    if (map.getSource('bounding-box')) {
        if (map.getLayer('bounding-box-fill')) {
            map.removeLayer('bounding-box-fill');
        }
        if (map.getLayer('bounding-box-layer')) {
            map.removeLayer('bounding-box-layer');
        }
        map.removeSource('bounding-box');
    }
    
    // Add new bounding box
    map.addSource('bounding-box', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates]
            },
            properties: {}
        }
    });
    
    map.addLayer({
        id: 'bounding-box-layer',
        type: 'line',
        source: 'bounding-box',
        paint: {
            'line-color': '#ff0000',
            'line-width': 4,
            'line-opacity': 1.0
        }
    });
    
    map.addLayer({
        id: 'bounding-box-fill',
        type: 'fill',
        source: 'bounding-box',
        paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.1
        }
    });
    
    boundingBoxSource = map.getSource('bounding-box');
}

function finalizeBoundingBox(start, end) {
    console.log('Finalizing bounding box from', start, 'to', end);
    
    const coordinates = [
        [start.lng, start.lat],
        [end.lng, start.lat],
        [end.lng, end.lat],
        [start.lng, end.lat]
    ];
    
    // Draw the final bounding box
    drawBoundingBox(start, end);
    
    // Display coordinates
    displayCoordinates(coordinates);
    
    // Show coordinates div
    coordinatesDiv.classList.add('show');
    
    // Show confirmation dialog
    showConfirmationDialog(start, end);
}

function clearBoundingBox() {
    if (map.getSource('bounding-box')) {
        map.removeLayer('bounding-box-fill');
        map.removeLayer('bounding-box-layer');
        map.removeSource('bounding-box');
    }
    
    // Hide coordinates div
    coordinatesDiv.classList.remove('show');
    coordinateList.innerHTML = '';
    
    // Hide API status
    apiStatusDiv.style.display = 'none';
    
    boundingBoxSource = null;
}

function displayCoordinates(coordinates) {
    const cornerNames = ['Top-Left', 'Top-Right', 'Bottom-Right', 'Bottom-Left'];
    
    coordinateList.innerHTML = '';
    
    coordinates.forEach((coord, index) => {
        const coordDiv = document.createElement('div');
        coordDiv.className = 'coordinate-item';
        coordDiv.innerHTML = `
            <strong>${cornerNames[index]}:</strong><br>
            Longitude: ${coord[0].toFixed(6)}<br>
            Latitude: ${coord[1].toFixed(6)}
        `;
        coordinateList.appendChild(coordDiv);
    });
    
    // Add bounding box dimensions
    const width = Math.abs(coordinates[1][0] - coordinates[0][0]);
    const height = Math.abs(coordinates[0][1] - coordinates[3][1]);
    
    const dimensionsDiv = document.createElement('div');
    dimensionsDiv.className = 'coordinate-item';
    dimensionsDiv.style.marginTop = '10px';
    dimensionsDiv.style.borderTop = '1px solid #ccc';
    dimensionsDiv.style.paddingTop = '10px';
    dimensionsDiv.innerHTML = `
        <strong>Bounding Box Dimensions:</strong><br>
        Width: ${width.toFixed(6)}° longitude<br>
        Height: ${height.toFixed(6)}° latitude
    `;
    coordinateList.appendChild(dimensionsDiv);
}

function showConfirmationDialog(start, end) {
    // Calculate min/max coordinates for display
    const minLng = Math.min(start.lng, end.lng);
    const maxLng = Math.max(start.lng, end.lng);
    const minLat = Math.min(start.lat, end.lat);
    const maxLat = Math.max(start.lat, end.lat);
    
    const message = `Would you like to create a dataset with this bounding box?\n\n` +
                   `Bounding Box Coordinates:\n` +
                   `Min Lat: ${minLat.toFixed(6)}\n` +
                   `Min Lng: ${minLng.toFixed(6)}\n` +
                   `Max Lat: ${maxLat.toFixed(6)}\n` +
                   `Max Lng: ${maxLng.toFixed(6)}`;
    
    if (confirm(message)) {
        // User clicked "OK" - proceed with API call
        sendBoundingBoxToAPI(start, end);
    } else {
        // User clicked "Cancel" - just show the coordinates without API call
        console.log('User cancelled dataset creation');
        // Hide any existing API status
        apiStatusDiv.style.display = 'none';
    }
}

function sendBoundingBoxToAPI(start, end) {
    // Calculate min/max coordinates for the bounding box
    const minLng = Math.min(start.lng, end.lng);
    const maxLng = Math.max(start.lng, end.lng);
    const minLat = Math.min(start.lat, end.lat);
    const maxLat = Math.max(start.lat, end.lat);
    
    // Create the dataset object with bounding box coordinates
    const dataset = {
        title: "NSI building inventory dataset",
        description: "Example description",
        bounding_box: [minLat, minLng, maxLat, maxLng] // [minY, minX, maxY, maxX] format
    };
    
    console.log('Sending bounding box to API:', dataset);
    
    // Show API status
    apiStatusDiv.style.display = 'block';
    apiStatusDiv.className = 'api-status';
    apiStatusText.textContent = 'Sending bounding box to API...';
    
    // Create FormData for the API call
    const formData = new FormData();
    formData.append('dataset', JSON.stringify(dataset));
    formData.append('type', 'application/json');
    
    // Make the API call
    fetch('https://tools.in-core.org/data/api/datasets/tools/bldg-inventory', {
        method: 'POST',
        headers: {
            'Authorization': 'bearer with token' // You'll need to replace this with actual token
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API call successful:', data);
        apiStatusDiv.className = 'api-status success';
        apiStatusText.textContent = 'API call successful! Dataset created.';
    })
    .catch(error => {
        console.error('API call failed:', error);
        apiStatusDiv.className = 'api-status error';
        
        // Handle CORS errors specifically
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            apiStatusText.textContent = 'API call blocked by CORS policy. This is expected when running from a local file.';
        } else {
            apiStatusText.textContent = `API call failed: ${error.message}`;
        }
    });
}

// Handle window resize
window.addEventListener('resize', function() {
    map.resize();
}); 
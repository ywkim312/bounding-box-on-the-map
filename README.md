# US Map with Bounding Box Webapp

A web application built with MapLibre GL JS that displays an interactive map of the United States with bounding box drawing functionality.

## Features

1. **Interactive US Map**: Shows a detailed map of the United States with streets, cities, and geographic information
2. **Navigation Controls**: Zoom in/out, pan, and navigate the map
3. **Bounding Box Drawing**: Draw rectangular bounding boxes on the map
4. **Coordinate Display**: View the coordinates of all four corners of the bounding box
5. **Mobile Support**: Works on both desktop and mobile devices

## How to Use

### Starting the Application

From the command prompt at `C:\workspace-ywkim\bounding-box-on-the-map`:

**Option 1: Direct Browser Opening (Windows - Recommended)**
```cmd
start index.html
```

**Option 2: Using Python HTTP Server (if Python is installed)**
```cmd
python -m http.server 8000
```
Then open your browser and go to: `http://localhost:8000`

**Option 3: Using Node.js http-server (if Node.js is installed)**
```cmd
npx http-server -p 8000
```
Then open your browser and go to: `http://localhost:8000`

**Option 4: Using PHP (if PHP is installed)**
```cmd
php -S localhost:8000
```
Then open your browser and go to: `http://localhost:8000`

### Using the Application

1. **Navigate the Map**: 
   - Use mouse wheel to zoom in/out
   - Click and drag to pan around the map
   - Use the navigation controls in the top-right corner
2. **Draw a Bounding Box**:
   - Check the "Bounding Box" checkbox in the top-left control panel
   - Click and drag on the map to draw a rectangular bounding box
   - The bounding box will appear in red color
3. **View Coordinates**: After drawing a bounding box, the coordinates of all four corners will be displayed in the control panel
4. **API Integration**: When a bounding box is drawn, the application automatically sends the coordinates to the building inventory API

## Technical Details

- **Map Engine**: MapLibre GL JS (open-source alternative to Mapbox GL JS)
- **Map Style**: CartoDB Positron (clean, detailed map with street information)
- **Bounding Box Color**: Red (#ff0000) with 80% opacity for borders and 10% opacity for fill
- **Coordinate Format**: Decimal degrees with 6 decimal places precision

## File Structure

```
bounding-box-on-the-map/
├── index.html          # Main HTML file with UI structure
├── script.js           # JavaScript functionality for map and bounding box
└── README.md           # This documentation file
```

## Browser Compatibility

This application works in all modern browsers that support WebGL:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Dependencies

The application uses CDN-hosted MapLibre GL JS library, so no local installation is required. All dependencies are loaded automatically when you open the HTML file.

## API Configuration

The application automatically sends bounding box coordinates to the building inventory API when a bounding box is drawn. To configure the API:

1. **Update Authorization Token**: In `script.js`, replace `'bearer with token'` with your actual authorization token on line 295
2. **API Endpoint**: The default endpoint is `https://tools.in-core.org/data/api/datasets/tools/bldg-inventory`
3. **Bounding Box Format**: Coordinates are sent as `[minLat, minLng, maxLat, maxLng]` format

### CORS Limitation

**Note**: Due to CORS (Cross-Origin Resource Sharing) policies, the API calls may be blocked when running the application from a local file (`file://` protocol). This is a browser security feature. The application will show a user-friendly error message when this occurs.

To avoid CORS issues, run the application using one of the HTTP server options listed in the "Starting the Application" section above.

## Customization

You can customize the application by modifying:
- Map style URL in `script.js` (line 3)
- Map center coordinates and zoom level in `script.js` (lines 4-6)
- Bounding box color in `script.js` (lines 175 and 185)
- API endpoint and authorization in `script.js` (lines 295-296)
- UI styling in the `<style>` section of `index.html` 
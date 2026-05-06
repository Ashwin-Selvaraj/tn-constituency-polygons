import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load GeoJSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const geojsonPath = path.join(__dirname, 'constituencies.geojson');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Your test coordinates
const lat = 11.189864660448045;
const lng = 77.27047679555436;


if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
  throw new Error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
}


// IMPORTANT: GeoJSON uses [lng, lat]
const point = turf.point([lng, lat]);

let found = null;
let matchedFeature = null;

for (const feature of geojson.features) {
  if (turf.booleanPointInPolygon(point, feature)) {
    matchedFeature = feature;
    found =
      feature.properties.AC_NAME ||
      feature.properties.name ||
      feature.properties.constituency ||
      "Unknown";
    break;
  }
}

if (matchedFeature) {
  console.log("👉 Constituency:", found);
} else {
  const centroids = turf.featureCollection(
    geojson.features.map((feature) =>
      turf.centroid(feature, {
        properties: {
          AC_NAME:
            feature.properties.AC_NAME ||
            feature.properties.name ||
            feature.properties.constituency ||
            "Unknown",
        },
      }),
    ),
  );
  const nearest = turf.nearestPoint(point, centroids);
  console.log("👉 No containing constituency found for this exact point.");
  console.log("📍 Nearest constituency:", nearest.properties.AC_NAME);
}
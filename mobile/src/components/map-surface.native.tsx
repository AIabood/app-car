/**
 * MapSurface — OpenStreetMap Leaflet Implementation (WebView)
 *
 * Provides a 100% free, real, interactive OpenStreetMap experience
 * with zero paid APIs, zero credit cards, and zero Google Maps API keys.
 *
 * Features:
 * - Real interactive OpenStreetMap tiles (CartoDB Voyager / OSM)
 * - Real GPS user location marker + directional pulse
 * - Riyadh landmark markers (Kingdom Centre, Airport, Boulevard, etc.)
 * - Route polyline between user and selected destination
 * - Smooth camera panning & zoom bounds
 * - Navigation car simulation movement
 * - Two-way communication with React Native UI
 */

import { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MOCK_LOCATIONS, AppLocation } from '@/constants/mock-locations';

export const FALLBACK_LOCATION = {
  latitude: 24.7136,
  longitude: 46.6753,
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapSurfaceProps = {
  userLocation: Coordinates;
  simulationLocation?: Coordinates | null;
  selectedLocation?: AppLocation | null;
  isNavigating?: boolean;
  navigationProgress?: number;
  onSelectLocation?: (loc: AppLocation) => void;
  recenterTrigger?: number;
};

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #E5E3DF;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .leaflet-control-attribution {
      font-size: 8px !important;
      background: rgba(255,255,255,0.7) !important;
      padding: 2px 4px !important;
    }
    /* Custom User / Car Marker */
    .user-marker-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #007AFF;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 10px rgba(0,122,255,0.6);
      position: relative;
    }
    .user-dot.navigating {
      background: #34C759;
      box-shadow: 0 0 12px rgba(52,199,89,0.7);
    }
    .pulse-ring {
      position: absolute;
      top: -6px;
      left: -6px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #007AFF;
      animation: pulse 1.8s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    /* Custom Location Pin */
    .landmark-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #374151;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: #FFFFFF;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .landmark-pin.selected {
      background: #34C759;
      width: 38px;
      height: 38px;
      box-shadow: 0 0 12px rgba(52,199,89,0.8);
      transform: scale(1.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([24.7136, 46.6753], 13);

    // OpenStreetMap Tiles via CartoDB Voyager CDN (Fast, reliable, beautiful)
    L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var userMarker = null;
    var destinationMarkers = {};
    var routeLine = null;
    var isNavigatingState = false;

    // Custom Icon Creators
    function createUserIcon(isNavigating) {
      var dotClass = isNavigating ? 'user-dot navigating' : 'user-dot';
      var pulse = isNavigating ? '' : '<div class="pulse-ring"></div>';
      var icon = isNavigating ? '🚗' : '';
      return L.divIcon({
        className: 'user-marker-icon',
        html: '<div class="' + dotClass + '">' + pulse + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    }

    function createLandmarkIcon(id, isSelected) {
      var iconChar = id === '3' ? '✈️' : '📍';
      var selectedClass = isSelected ? 'landmark-pin selected' : 'landmark-pin';
      return L.divIcon({
        className: '',
        html: '<div class="' + selectedClass + '">' + iconChar + '</div>',
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 19] : [16, 16]
      });
    }

    // Initialize User Marker
    function updateUserMarker(lat, lng, isNav) {
      if (!userMarker) {
        userMarker = L.marker([lat, lng], {
          icon: createUserIcon(isNav),
          zIndexOffset: 1000
        }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
        userMarker.setIcon(createUserIcon(isNav));
      }
    }

    // Initialize Landmarks
    function renderLandmarks(locations, selectedId) {
      locations.forEach(function(loc) {
        var isSelected = loc.id === selectedId;
        if (!destinationMarkers[loc.id]) {
          var m = L.marker([loc.latitude, loc.longitude], {
            icon: createLandmarkIcon(loc.id, isSelected),
            zIndexOffset: isSelected ? 800 : 500
          }).addTo(map);

          m.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SELECT_LOCATION',
                id: loc.id
              }));
            }
          });
          destinationMarkers[loc.id] = m;
        } else {
          destinationMarkers[loc.id].setIcon(createLandmarkIcon(loc.id, isSelected));
          destinationMarkers[loc.id].setZIndexOffset(isSelected ? 800 : 500);
        }
      });
    }

    // Draw Route
    function updateRoute(userLat, userLng, destLat, destLng) {
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }
      if (destLat && destLng) {
        routeLine = L.polyline([
          [userLat, userLng],
          [destLat, destLng]
        ], {
          color: '#007AFF',
          weight: 5,
          opacity: 0.85,
          dashArray: '10, 8',
          lineCap: 'round'
        }).addTo(map);

        var bounds = L.latLngBounds([[userLat, userLng], [destLat, destLng]]);
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true });
      }
    }

    // Command Listener from React Native
    window.onMessage = function(data) {
      try {
        var msg = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (msg.type === 'SYNC_STATE') {
          var uLat = msg.userLocation.latitude;
          var uLng = msg.userLocation.longitude;
          var sLat = msg.simulationLocation ? msg.simulationLocation.latitude : uLat;
          var sLng = msg.simulationLocation ? msg.simulationLocation.longitude : uLng;
          var isNav = msg.isNavigating;
          
          updateUserMarker(sLat, sLng, isNav);
          renderLandmarks(msg.locations, msg.selectedId);

          if (msg.selectedLoc) {
            updateRoute(uLat, uLng, msg.selectedLoc.latitude, msg.selectedLoc.longitude);
          } else if (routeLine) {
            map.removeLayer(routeLine);
            routeLine = null;
          }
        } else if (msg.type === 'CENTER_ON') {
          map.flyTo([msg.lat, msg.lng], 14, { duration: 0.8 });
        }
      } catch (e) {
        console.error('Error handling message', e);
      }
    };
  </script>
</body>
</html>
`;

export default function MapSurface({
  userLocation,
  simulationLocation,
  selectedLocation,
  isNavigating = false,
  onSelectLocation,
  recenterTrigger,
}: MapSurfaceProps) {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef(false);

  // Sync state with Leaflet WebView
  const syncState = useCallback(() => {
    if (!isLoadedRef.current || !webViewRef.current) return;

    const payload = {
      type: 'SYNC_STATE',
      userLocation: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      simulationLocation: simulationLocation ? {
        latitude: simulationLocation.latitude,
        longitude: simulationLocation.longitude,
      } : null,
      selectedId: selectedLocation?.id ?? null,
      selectedLoc: selectedLocation ? {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      } : null,
      isNavigating,
      locations: MOCK_LOCATIONS,
    };

    const js = `if (window.onMessage) { window.onMessage(${JSON.stringify(payload)}); } true;`;
    webViewRef.current.injectJavaScript(js);
  }, [userLocation, simulationLocation, selectedLocation, isNavigating]);

  // Sync on prop changes
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Recenter trigger
  useEffect(() => {
    if (recenterTrigger !== undefined && isLoadedRef.current && webViewRef.current) {
      const payload = {
        type: 'CENTER_ON',
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
      webViewRef.current.injectJavaScript(
        `if (window.onMessage) { window.onMessage(${JSON.stringify(payload)}); } true;`
      );
    }
  }, [recenterTrigger, userLocation]);

  // Handle messages from WebView (e.g. user tapped a marker on the map)
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_LOCATION' && onSelectLocation) {
        const found = MOCK_LOCATIONS.find((l) => l.id === data.id);
        if (found) {
          onSelectLocation(found);
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: LEAFLET_HTML }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onLoadEnd={() => {
          isLoadedRef.current = true;
          syncState();
        }}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E3DF',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
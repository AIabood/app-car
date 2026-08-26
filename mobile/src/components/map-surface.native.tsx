/**
 * MapSurface — OpenStreetMap Leaflet Implementation (WebView)
 *
 * Fully featured interactive OpenStreetMap with:
 * - Start Location Marker (Green Pin / Start Flag)
 * - Destination Marker (Red Pin / Destination Flag)
 * - Dynamic Route Polyline
 * - Automatic Route viewport fitBounds
 * - Active driving car animation
 * - Riyadh landmarks selection
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { AppLocation } from '@/types/navigation';
import { MOCK_LOCATIONS } from '@/constants/mock-locations';

export const FALLBACK_LOCATION = {
  latitude: 24.7136,
  longitude: 46.6753,
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapSurfaceProps = {
  startLocation: AppLocation;
  destination?: AppLocation | null;
  simulationLocation?: Coordinates | null;
  isNavigating?: boolean;
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
      background: #0D1117;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .leaflet-control-attribution {
      font-size: 8px !important;
      background: rgba(13, 17, 23, 0.7) !important;
      color: #8B949E !important;
      padding: 2px 5px !important;
      border-radius: 4px;
    }
    .leaflet-control-attribution a {
      color: #58A6FF !important;
      text-decoration: none;
    }
    
    /* Start Pin (Green) */
    .start-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.8), 0 4px 6px rgba(0,0,0,0.4);
      color: #FFFFFF;
      font-size: 16px;
      position: relative;
    }
    .start-pulse {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #10B981;
      animation: pulseGreen 2s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulseGreen {
      0% { transform: scale(0.7); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Destination Pin (Red/Neon) */
    .dest-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #EF4444;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.85), 0 4px 8px rgba(0,0,0,0.5);
      color: #FFFFFF;
      font-size: 18px;
      position: relative;
      animation: bouncePin 1.5s infinite alternate ease-in-out;
    }
    @keyframes bouncePin {
      0% { transform: translateY(0); }
      100% { transform: translateY(-6px); }
    }

    /* Car Pin (Driving Simulation) */
    .car-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0066FF;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 16px rgba(0, 102, 255, 0.9);
      font-size: 20px;
      z-index: 1000;
    }

    /* Landmark Location Pin */
    .landmark-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #1F2937;
      border: 2px solid #9CA3AF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: #FFFFFF;
      font-size: 13px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .landmark-pin:active {
      transform: scale(1.2);
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

    // OpenStreetMap tiles via CartoDB Voyager
    L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var startMarker = null;
    var destMarker = null;
    var carMarker = null;
    var destinationMarkers = {};
    var routePolyline = null;

    function createStartIcon() {
      return L.divIcon({
        className: '',
        html: '<div class="start-pin"><div class="start-pulse"></div>📍</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
    }

    function createDestIcon() {
      return L.divIcon({
        className: '',
        html: '<div class="dest-pin">🏁</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
    }

    function createCarIcon() {
      return L.divIcon({
        className: '',
        html: '<div class="car-pin">🚗</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
    }

    function createLandmarkIcon(id) {
      var iconChar = id === '3' ? '✈️' : '📌';
      return L.divIcon({
        className: '',
        html: '<div class="landmark-pin">' + iconChar + '</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
    }

    function renderLandmarks(locations) {
      locations.forEach(function(loc) {
        if (!destinationMarkers[loc.id]) {
          var m = L.marker([loc.latitude, loc.longitude], {
            icon: createLandmarkIcon(loc.id),
            zIndexOffset: 300
          }).addTo(map);

          m.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SELECT_LANDMARK',
                id: loc.id
              }));
            }
          });
          destinationMarkers[loc.id] = m;
        }
      });
    }

    // Command listener
    window.onMessage = function(data) {
      try {
        var msg = typeof data === 'string' ? JSON.parse(data) : data;

        if (msg.type === 'SYNC_ROUTE_STATE') {
          var start = msg.startLocation;
          var dest = msg.destination;
          var sim = msg.simulationLocation;
          var isNav = msg.isNavigating;

          renderLandmarks(msg.locations || []);

          // 1. Update Start Marker
          if (start) {
            if (!startMarker) {
              startMarker = L.marker([start.latitude, start.longitude], {
                icon: createStartIcon(),
                zIndexOffset: 900
              }).addTo(map);
            } else {
              startMarker.setLatLng([start.latitude, start.longitude]);
            }
          }

          // 2. Update Destination Marker
          if (dest) {
            if (!destMarker) {
              destMarker = L.marker([dest.latitude, dest.longitude], {
                icon: createDestIcon(),
                zIndexOffset: 950
              }).addTo(map);
            } else {
              destMarker.setLatLng([dest.latitude, dest.longitude]);
            }
          } else {
            if (destMarker) {
              map.removeLayer(destMarker);
              destMarker = null;
            }
          }

          // 3. Update Route Polyline & fitBounds
          if (start && dest) {
            var coords = [
              [start.latitude, start.longitude],
              [dest.latitude, dest.longitude]
            ];

            if (!routePolyline) {
              routePolyline = L.polyline(coords, {
                color: '#0066FF',
                weight: 6,
                opacity: 0.9,
                dashArray: '12, 8',
                lineCap: 'round'
              }).addTo(map);
            } else {
              routePolyline.setLatLngs(coords);
            }

            if (!isNav) {
              var bounds = L.latLngBounds(coords);
              map.fitBounds(bounds, {
                paddingTopLeft: [50, 140],
                paddingBottomRight: [50, 260],
                maxZoom: 15,
                animate: true
              });
            }
          } else {
            if (routePolyline) {
              map.removeLayer(routePolyline);
              routePolyline = null;
            }
          }

          // 4. Update Car Marker (Navigation mode)
          if (isNav && sim) {
            if (!carMarker) {
              carMarker = L.marker([sim.latitude, sim.longitude], {
                icon: createCarIcon(),
                zIndexOffset: 1200
              }).addTo(map);
            } else {
              carMarker.setLatLng([sim.latitude, sim.longitude]);
            }
          } else {
            if (carMarker) {
              map.removeLayer(carMarker);
              carMarker = null;
            }
          }
        } else if (msg.type === 'CENTER_CAMERA') {
          map.flyTo([msg.lat, msg.lng], 14, { duration: 0.8 });
        }
      } catch (e) {
        console.error('Error handling map command', e);
      }
    };
  </script>
</body>
</html>
`;

export default function MapSurface({
  startLocation,
  destination,
  simulationLocation,
  isNavigating = false,
  onSelectLocation,
  recenterTrigger,
}: MapSurfaceProps) {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef(false);

  const syncState = useCallback(() => {
    if (!isLoadedRef.current || !webViewRef.current) return;

    const payload = {
      type: 'SYNC_ROUTE_STATE',
      startLocation: {
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      },
      destination: destination
        ? {
            latitude: destination.latitude,
            longitude: destination.longitude,
          }
        : null,
      simulationLocation: simulationLocation
        ? {
            latitude: simulationLocation.latitude,
            longitude: simulationLocation.longitude,
          }
        : null,
      isNavigating,
      locations: MOCK_LOCATIONS,
    };

    const js = `if (window.onMessage) { window.onMessage(${JSON.stringify(payload)}); } true;`;
    webViewRef.current.injectJavaScript(js);
  }, [startLocation, destination, simulationLocation, isNavigating]);

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    if (recenterTrigger !== undefined && isLoadedRef.current && webViewRef.current) {
      const payload = {
        type: 'CENTER_CAMERA',
        lat: startLocation.latitude,
        lng: startLocation.longitude,
      };
      webViewRef.current.injectJavaScript(
        `if (window.onMessage) { window.onMessage(${JSON.stringify(payload)}); } true;`
      );
    }
  }, [recenterTrigger, startLocation]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_LANDMARK' && onSelectLocation) {
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
    backgroundColor: '#0D1117',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
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
import { AppLocation, RoutePoint } from '@/types/navigation';

export const FALLBACK_LOCATION = {
  latitude: 31.9539,
  longitude: 35.9106,
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapSurfaceProps = {
  startLocation: AppLocation;
  destination?: AppLocation | null;
  /** Real road-based route geometry from OSRM. Overrides straight-line polyline when provided. */
  routeGeometry?: RoutePoint[] | null;
  simulationLocation?: Coordinates | null;
  isNavigating?: boolean;
  onSelectLocation?: (loc: AppLocation) => void;
  recenterTrigger?: number;
  focusNonce?: number;
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
    }).setView([31.9539, 35.9106], 13);

    var CARTO_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfNjc4MmgzbDYiLCJqdGkiOiIxZDY5NmExMiIsImV4cCI6MTgxOTM5MzI2MH0.XLWY-BasSgUnZJOe6SVQupFv3w3Wu0IYGZxPy_P8LrE';

    // High-performance OpenStreetMap tiles via CartoDB Voyager with API Key authentication
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=' + CARTO_API_KEY, {
      maxZoom: 20,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    var startMarker = null;
    var destMarker = null;
    var carMarker = null;
    var routePolyline = null;
    var routeHalo = null;

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

    function fitBoth(start, dest) {
      var bounds = L.latLngBounds([
        [start.latitude, start.longitude],
        [dest.latitude, dest.longitude]
      ]);
      map.fitBounds(bounds, {
        paddingTopLeft: [50, 140],
        paddingBottomRight: [50, 260],
        maxZoom: 15,
        animate: true
      });
    }

    window.onMessage = function(data) {
      try {
        var msg = typeof data === 'string' ? JSON.parse(data) : data;

        if (msg.type === 'SYNC_ROUTE_STATE') {
          var start = msg.startLocation;
          var dest = msg.destination;
          var sim = msg.simulationLocation;
          var isNav = msg.isNavigating;

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

          if (dest) {
            if (!destMarker) {
              destMarker = L.marker([dest.latitude, dest.longitude], {
                icon: createDestIcon(),
                zIndexOffset: 950
              }).addTo(map);
            } else {
              destMarker.setLatLng([dest.latitude, dest.longitude]);
            }
          } else if (destMarker) {
            map.removeLayer(destMarker);
            destMarker = null;
          }

          if (start && dest) {
            // Only draw straight-line fallback if no real route geometry exists yet
            // Real geometry is drawn separately via DRAW_ROUTE_GEOMETRY message
          } else if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
          }

          if (isNav && sim) {
            if (!carMarker) {
              carMarker = L.marker([sim.latitude, sim.longitude], {
                icon: createCarIcon(),
                zIndexOffset: 1200
              }).addTo(map);
            } else {
              carMarker.setLatLng([sim.latitude, sim.longitude]);
            }
          } else if (carMarker) {
            map.removeLayer(carMarker);
            carMarker = null;
          }
        } else if (msg.type === 'CENTER_CAMERA' || msg.type === 'FOCUS_LOCATION') {
          map.flyTo([msg.lat, msg.lng], msg.zoom || 15, { duration: 0.85 });
        } else if (msg.type === 'FIT_BOUNDS' && msg.start && msg.dest) {
          fitBoth(msg.start, msg.dest);
        } else if (msg.type === 'DRAW_ROUTE_GEOMETRY') {
          // Remove old route polylines
          if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
          if (routeHalo) { map.removeLayer(routeHalo); routeHalo = null; }

          var geoPoints = msg.points; // [[lat, lng], ...]
          if (!geoPoints || geoPoints.length < 2) return;

          // White halo (bottom layer) for premium look
          routeHalo = L.polyline(geoPoints, {
            color: '#FFFFFF',
            weight: 10,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          // Blue route line (top layer)
          routePolyline = L.polyline(geoPoints, {
            color: '#0066FF',
            weight: 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
        } else if (msg.type === 'CLEAR_ROUTE') {
          if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
          if (routeHalo) { map.removeLayer(routeHalo); routeHalo = null; }
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
  routeGeometry,
  simulationLocation,
  isNavigating = false,
  recenterTrigger,
  focusNonce,
}: MapSurfaceProps) {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef(false);

  const postToMap = useCallback((payload: object) => {
    if (!isLoadedRef.current || !webViewRef.current) return;
    const js = `if (window.onMessage) { window.onMessage(${JSON.stringify(payload)}); } true;`;
    webViewRef.current.injectJavaScript(js);
  }, []);

  const syncState = useCallback(() => {
    postToMap({
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
    });
  }, [postToMap, startLocation, destination, simulationLocation, isNavigating]);

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    if (!recenterTrigger) return;
    postToMap({
      type: 'CENTER_CAMERA',
      lat: startLocation.latitude,
      lng: startLocation.longitude,
      zoom: 15,
    });
  }, [recenterTrigger, startLocation, postToMap]);

  useEffect(() => {
    if (!focusNonce) return;
    if (destination) {
      postToMap({
        type: 'FIT_BOUNDS',
        start: {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
        },
        dest: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      });
      return;
    }
    postToMap({
      type: 'FOCUS_LOCATION',
      lat: startLocation.latitude,
      lng: startLocation.longitude,
      zoom: 16,
    });
  }, [focusNonce, destination, startLocation, postToMap]);

  // Send real road geometry to Leaflet whenever OSRM returns it
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (routeGeometry && routeGeometry.length >= 2) {
      // Convert to [lat, lng] pairs that Leaflet expects
      const points = routeGeometry.map((p) => [p.latitude, p.longitude]);
      postToMap({ type: 'DRAW_ROUTE_GEOMETRY', points });
    } else {
      postToMap({ type: 'CLEAR_ROUTE' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGeometry, postToMap]);

  const handleMessage = (_event: WebViewMessageEvent) => {
    // Place selection is handled in React Native, not from map landmarks.
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
          postToMap({
            type: 'CENTER_CAMERA',
            lat: startLocation.latitude,
            lng: startLocation.longitude,
            zoom: 14,
          });
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
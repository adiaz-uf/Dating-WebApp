import React, { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '../profile/types';
import { calculateDistance } from '../../lib/CalculateDistance';

declare global {
  interface Window {
    L: any;
    handleUserMapClick?: (userId: string) => void;
  }
}

interface InteractiveMapProps {
  users: UserProfile[];
  currentUser?: UserProfile;
  onUserClick?: (user: UserProfile) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  users, 
  currentUser, 
  onUserClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        
        script.onload = () => {
          setIsLoaded(true);
        };
        
        document.head.appendChild(script);
      } else {
        setIsLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Default center (Madrid, Spain)
    let centerLat = 40.4168;
    let centerLng = -3.7038;
    
    // Use current user location if available
    if (currentUser?.latitude && currentUser?.longitude) {
      centerLat = Number(currentUser.latitude);
      centerLng = Number(currentUser.longitude);
    }

    // Initialize map
    const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 100);

    // Add tile layer - Using CartoDB Positron for a clean, minimal look
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded, currentUser]);

  // Update markers when users change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Create custom icons
    const createCustomIcon = (isCurrentUser: boolean, user: UserProfile) => {
      const iconColor = isCurrentUser ? '#ec4899' : '#db2777';
      const iconSize = isCurrentUser ? 32 : 28;
      
      return window.L.divIcon({
        html: `
          <div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background: ${iconColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(219, 39, 119, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isCurrentUser ? '14px' : '12px'};
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            ${user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
      });
    };

    // Add current user marker
    if (currentUser?.latitude && currentUser?.longitude) {
      const currentUserMarker = window.L.marker(
        [Number(currentUser.latitude), Number(currentUser.longitude)],
        { icon: createCustomIcon(true, currentUser) }
      ).addTo(mapInstanceRef.current);

      currentUserMarker.bindPopup(`
        <div style="
          text-align: center; 
          min-width: 180px; 
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
          border-radius: 16px;
          padding: 16px;
          border: 2px solid #db2777;
          box-shadow: 0 8px 25px rgba(219, 39, 119, 0.2);
        ">
          <div style="
            width: 70px; 
            height: 70px; 
            border-radius: 50%; 
            overflow: hidden; 
            margin: 0 auto 12px auto;
            border: 3px solid #db2777;
            box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
          ">
            <img src="${currentUser.main_img || '/default-avatar.png'}" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 alt="${currentUser.first_name}" />
          </div>
          <h3 style="
            margin: 0; 
            font-size: 18px; 
            color: #db2777;
            font-weight: bold;
            margin-bottom: 8px;
          ">${currentUser.first_name || currentUser.username}</h3>
          <div style="
            background: #db2777;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 8px;
          ">
            📍 You are here
          </div>
          <p style="
            margin: 4px 0; 
            font-size: 13px; 
            color: #7c2d12;
            font-weight: 500;
        </div>
      `);

      markersRef.current.push(currentUserMarker);
    }

    // Add other users markers
    users.forEach(user => {
      if (user.latitude && user.longitude && user.id !== currentUser?.id) {
        const marker = window.L.marker(
          [Number(user.latitude), Number(user.longitude)],
          { icon: createCustomIcon(false, user) }
        ).addTo(mapInstanceRef.current);

        // Calculate distance if current user location is available
        let distanceText = '';
        if (currentUser?.latitude && currentUser?.longitude) {
          const distance = calculateDistance(
            Number(currentUser.latitude),
            Number(currentUser.longitude),
            Number(user.latitude),
            Number(user.longitude)
          );
          distanceText = `<p style="margin: 4px 0; font-size: 12px; color: #666;">📏 ${Math.round(distance)} km away</p>`;
        }

        marker.bindPopup(`
          <div style="
            text-align: center; 
            min-width: 200px; 
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            border-radius: 16px;
            padding: 16px;
            border: 2px solid #db2777;
            box-shadow: 0 8px 25px rgba(219, 39, 119, 0.2);
          ">
            <div style="
              width: 70px; 
              height: 70px; 
              border-radius: 50%; 
              overflow: hidden; 
              margin: 0 auto 12px auto;
              border: 3px solid #db2777;
              box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
            ">
              <img src="${user.main_img || '/default-avatar.png'}" 
                   style="width: 100%; height: 100%; object-fit: cover;" 
                   alt="${user.first_name}" />
            </div>
            <h3 style="
              margin: 0; 
              font-size: 18px; 
              color: #db2777;
              font-weight: bold;
              margin-bottom: 8px;
            ">${user.first_name || user.username}</h3>
            <div style="
              background: linear-gradient(135deg, #db2777 0%, #ec4899 100%);
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 8px;
            ">
              ⭐ Fame: ${user.fame_rating || 0}
            </div>
            ${distanceText ? `
              <div style="
                background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: inline-block;
                margin-bottom: 8px;
              ">
                📍 ${distanceText.match(/(\d+) km/)?.[1] || 'Unknown'} km away
              </div>
            ` : ''}
            <button 
              onclick="window.handleUserMapClick('${user.id}')"
              style="
                background: linear-gradient(135deg, #db2777 0%, #ec4899 100%);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
                width: 100%;
                margin-top: 8px;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(219, 39, 119, 0.4)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(219, 39, 119, 0.3)'"
            >
              View Profile
            </button>
          </div>
        `);

        markersRef.current.push(marker);
      }
    });

  }, [users, currentUser, isLoaded]);

  // Set up global click handler
  useEffect(() => {
    window.handleUserMapClick = (userId: string) => {
      const user = users.find(u => u.id === userId);
      if (user && onUserClick) {
        onUserClick(user);
      }
    };

    return () => {
      if (window.handleUserMapClick) {
        delete window.handleUserMapClick;
      }
    };
  }, [users, onUserClick]);

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Users Near You</h2>
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border-2 border-pink-200 shadow-lg"
        style={{ minHeight: '400px' }}
      />
      <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-400 rounded-full border-2 border-white"></div>
          <span>You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-600 rounded-full border-2 border-white"></div>
          <span>Other users</span>
        </div>
        <span className="text-gray-500">Click on markers to see user details</span>
      </div>
    </div>
  );
};

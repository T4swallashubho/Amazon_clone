import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../Store';
import { GoogleMap, StandaloneSearchBox, Marker } from '@react-google-maps/api';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const defaultLocation = { lat: 45.516, lng: -73.56 };

function MapScreen() {
  const { state, dispatch: cxtDispatch } = useContext(Store);

  const navigate = useNavigate();
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);

  const { userInfo } = state;

  // multiple useRefs for mapref, placeref and markerref

  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('geolocation not supported by the browser');
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  // by default would run first
  const onLoad = (map) => {
    mapRef.current = map;
  };

  // this would run when the dragging has been stopped/finsihed by the user on the map
  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setCenter({ lat: place.lat(), lng: place.lng() });
    setLocation({ lat: place.lat(), lng: place.lng() });
  };

  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  const onConfirm = () => {
    const places = placeRef.current.getPlaces() || [{}];

    cxtDispatch({
      type: 'Save_Shipping_Address_Map_Location',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });

    toast.success('location selected successfully');
    navigate('/shipping');
  };

  // once component is mounted/registered this runs
  useEffect(() => {
    cxtDispatch({ type: 'Set_FullBox_On' });

    if (!userInfo) {
      navigate('/signin');
    }

    getUserLocation();
  }, [userInfo, cxtDispatch, navigate]);

  return (
    <div className="fullBox">
      <GoogleMap
        onLoad={onLoad}
        onIdle={onIdle}
        center={center}
        mapContainerStyle={{ height: '100%', width: '100%' }}
        zoom={15}
      >
        <StandaloneSearchBox
          onLoad={onLoadPlaces}
          onPlacesChanged={onPlacesChanged}
        >
          <>
            {' '}
            <div className="map-input-box">
              <input type="text" placeholder="Enter your address" />
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </>
        </StandaloneSearchBox>

        <Marker position={location} onLoad={onMarkerLoad}></Marker>
      </GoogleMap>
    </div>
  );
}

export default MapScreen;

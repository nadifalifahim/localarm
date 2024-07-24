"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import markerShadow from "../../node_modules/leaflet/dist/images/marker-shadow.png";
import "leaflet-geosearch/dist/geosearch.css";
import SearchField from "./SearchField";
import { Check, MapPinned, Navigation, X } from "lucide-react";

const userIcon = new L.Icon({
  iconUrl: "/user.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [1, -34],
});

const destinationIcon = new L.Icon({
  iconUrl: "/location-pin 2x.png",
  iconSize: [40, 40],
  iconAnchor: [20, 25],
  popupAnchor: [1, -34],
});

const searchedIcon = new L.Icon({
  iconUrl: "/circle.png",
  iconSize: [40, 40],
  iconAnchor: [20, 25],
  popupAnchor: [1, -34],
});

const Map = () => {
  const [radius, setRadius] = useState(300);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(
    null
  );
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [updateMode, setUpdateMode] = useState(false);
  const [updateMap, setUpdateMap] = useState(false);
  const [isInRadius, setIsInRadius] = useState(false);

  // Create a ref to hold the Audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the Audio instance on component mount
  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
    return () => {
      audioRef.current?.pause();
      audioRef.current?.remove();
    };
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLiveLocation([latitude, longitude]);
          setCenter([latitude, longitude]); // Update map center to the user's location
          checkLocationInCircle([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to a default location if geolocation fails
          setCenter([51.505, -0.09]);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // Cache location for up to 10 seconds
          timeout: 5000, // Wait up to 5 seconds for a location update
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (marker) {
      interval = setInterval(() => {
        if (liveLocation) {
          checkLocationInCircle(liveLocation);
        }
      }, 1000); // Check location every 1 second
    } else if (marker == null && interval) {
      clearInterval(interval);
      interval = null;
    }

    return () => {
      if (interval) {
        clearInterval(interval); // Clear the interval on unmount or mode change
      }
    };
  }, [marker, radius]);

  const resetCenter = () => {
    if (liveLocation) {
      setCenter(liveLocation);
    }
  };

  const checkLocationInCircle = (location: [number, number]) => {
    if (marker) {
      // Create a Leaflet LatLng object for the live location and marker
      const liveLatLng = L.latLng(location[0], location[1]);
      const markerLatLng = L.latLng(marker[0], marker[1]);

      // Calculate the distance from the live location to the center of the circle
      const distance = liveLatLng.distanceTo(markerLatLng);
      console.log("Distance", distance);
      // Check if the distance is less than or equal to the radius of the circle
      if (distance <= radius) {
        if (!isInRadius) {
          setIsInRadius(true);
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play();
          }
          if (navigator.vibrate) {
            navigator.vibrate([500, 500, 500]); // Vibrate for 500ms, pause for 500ms, vibrate for 500ms
          }
        }
      } else {
        setIsInRadius(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // Reset music to the beginning
        } // Reset music to the beginning
      }
    } else {
      setIsInRadius(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset music to the beginning
      } // Reset music to the beginning
    }
  };

  const handleMapClick = (event: L.LeafletMouseEvent) => {
    if (updateMode) {
      const { lat, lng } = event.latlng;
      setMarker([lat, lng]); // Set the marker to the clicked position
      setUpdateMode(false);
    }
  };

  const handleClearClick = () => {
    setMarker(null);
    setIsInRadius(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="w-[95%] mx-auto">
      <Card className=" mt-4 pt-4 shadow-lg ">
        <CardContent className="px-0 ">
          <div className="relative flex items-center justify-center z-10">
            <div className="absolute z-50 bottom-5 left-0 right-0 flex items-center w-full justify-center mt-10 gap-2">
              <Button
                onClick={() => setUpdateMode(!updateMode)}
                variant="outline"
                className="rounded-full shadow-lg text-xs"
              >
                {updateMode ? (
                  <>
                    Done <Check className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Update <MapPinned className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                onClick={() => resetCenter()}
                variant="outline"
                className="rounded-full shadow-lg text-xs"
              >
                Locate <Navigation className="h-4 w-4 ml-2"></Navigation>
              </Button>
              <Button
                onClick={() => handleClearClick()}
                variant="outline"
                className="rounded-full shadow-lg text-xs"
              >
                Clear
                <X className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <MapContainer
              center={center}
              zoom={16}
              style={{ height: "75vh", width: "90%" }}
              className="rounded-lg  z-10"
              zoomControl={false}
            >
              <MapClickHandler onMapClick={handleMapClick} />
              <SearchField setMarker={setMarker} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {liveLocation && (
                <Marker position={liveLocation} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
              )}

              {marker && (
                <Marker position={marker} icon={destinationIcon}>
                  <Popup>
                    You will be alerted when you <br /> enter the marked area.
                  </Popup>
                  <Circle
                    center={marker}
                    radius={radius}
                    color="orange"
                    fillColor="orange"
                    fillOpacity={0.2}
                  />
                </Marker>
              )}
              <MapUpdater
                center={center}
                zoom={16}
                updateMap={updateMode}
                setUpdateMap={setUpdateMap}
              />
            </MapContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="pt-4  shadow-lg ">
        <CardContent className="px-4 flex justify-between text-sm font-bold">
          <span>Alert Radius</span>
          <span>{(radius / 1000).toFixed(1)} km</span>
        </CardContent>
        <CardContent className="px-4">
          <Slider
            defaultValue={[radius]}
            max={5000}
            step={10}
            className={cn("mx-auto")}
            onValueChange={(value) => setRadius(value[0])}
          />
        </CardContent>
      </Card>
    </div>
  );
};

interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
  updateMap: boolean;
  setUpdateMap: (value: boolean) => void;
}

const MapUpdater = ({
  center,
  zoom,
  updateMap,
  setUpdateMap,
}: MapUpdaterProps) => {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (center[0] !== 0) {
      if (!initialized.current) {
        map.setView(center, zoom);
        initialized.current = true; // Set to true after initializing the map
        setUpdateMap(false);
        console.log(updateMap);
      }
    } else {
      // Optionally handle the case where center is [0, 0] if needed
      setUpdateMap(false);
    }
  }, [center, map, updateMap]);
  return null;
};

const MapClickHandler = ({
  onMapClick,
}: {
  onMapClick: (event: L.LeafletMouseEvent) => void;
}) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

export default Map;

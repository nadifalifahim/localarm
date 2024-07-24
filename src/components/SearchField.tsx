import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

interface SearchFieldProps {
  setMarker: (marker: [number, number]) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ setMarker }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: "BD", // Example: 'US' for the United States. Use the appropriate country code for your country
      },
    });
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: "bar",
      autoClose: false,
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: "Enter destination address",
      showMarker: false,
      classNames: {
        container: "search-control-container",
        button: "search-control-button",
        resetButton: "search-control-reset-button",
        msgbox: "search-control-msgbox",
        form: "search-control-form rounded-full",
        input: "search-control-input",
        resultlist: "search-control-resultlist",
        item: "search-control-item",
        notfound: "search-control-notfound",
      },
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result: any) => {
      const { x, y } = result?.location;
      setMarker([y, x]); // Update marker state
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, setMarker]);

  return null;
};

export default SearchField;

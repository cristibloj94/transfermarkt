import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from "leaflet";
import {
  TextField,
  Button,
  Backdrop,
  CircularProgress,
  Typography,
  InputAdornment,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import { CheckboxProps, getAllServicesData } from '../../utils/account';
import { refreshToken } from '../../utils/refreshToken';

import './map.scss';
import 'leaflet/dist/leaflet.css';

type Service = {
  distance: number;
  email: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  phone: string;
  services: CheckboxProps[];
  logo?: string;
  street: string;
  streetNumber: string;
  city: string;
  county: string;
  country: string;
};

type QueryProps = {
  allServices: {
    services: string[]
  }
}

const MapPage = () => {
  const [position, setPosition] = useState<[number, number] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [serviceTypes, setServiceTypes] = useState<string[] | undefined>(undefined);
  const [filterValue, setFilterValue] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [showPhoneNumber, setShowPhoneNumber] = useState<boolean>(false);

  const isSearchEnabled = searchQuery !== '' && filterValue?.length > 0;

  const clearAll = () => {
    setFilterValue([])
  }

  const selectAll = () => {
    if (serviceTypes) setFilterValue(serviceTypes)
  }

  const customIconMyLocation = new L.Icon({
    iconUrl: new URL("/driver-location.svg", import.meta.url).href,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const customIconServiceLocation = new L.Icon({
    iconUrl: new URL("/service-location.svg", import.meta.url).href,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  L.Icon.Default.mergeOptions({
    iconUrl: new URL("/driver-location.svg", import.meta.url).href,
  });

  const getServiceLogo = async (url?: string) => {
    if (!url) return null;
    try {
      const response = await fetch(url,
        {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;

    } catch {
      toast.error("Failed to fetch logo!");
    }
  }

  const handleSearch = async (searchString: string) => {
    const coordinates: string[] = searchString?.replace(/\s/g, "")?.split(',');
    const latitude = parseFloat(coordinates?.[0]);
    const longitude = parseFloat(coordinates?.[1]);
    const serviceList = filterValue?.map((value) => ({ service: value }))

    const processedServiceList = filterValue?.length === 0 ? serviceTypes?.map((service) => ({ service })) : serviceList;

    const reqBody = { latitude, longitude, serviceList: processedServiceList }
    try {
      const response = await fetch(
        'https://carservice.saas.ascendro.io/api/app/AB00ECEBDB6832BBE1D814F9A7662C0826EADD2D/search',
        {
          method: 'POST',
          body: JSON.stringify({ ...reqBody }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await response.json();

      const services = await Promise.all(
        data?.map(async (service: Service) => {
          const logo = await getServiceLogo(service?.logo);
          return { ...service, logo };
        })
      );

      if (data?.length > 0) return setServices(services);

    } catch {
      toast.error("Failed to fetch location!");
    }
  };

  const setServiceViewHistoryData = async (service: Service) => {
    try {
      await fetch(
        'https://carservice.saas.ascendro.io/api/app/AB00ECEBDB6832BBE1D814F9A7662C0826EADD2D/history',
        {
          method: 'POST',
          body: JSON.stringify({ email: service?.email }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setShowPhoneNumber(true)
    } catch {
      toast.error("Failed to set service view history!");
    }
  };

  const UpdateMapView = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    map.setView(coords, 13);
    return null;
  };

  const DynamicZoom = ({ loc1, loc2 }: { loc1: [number, number]; loc2: [number, number] }) => {
    const map = useMap();

    useEffect(() => {
      if (!map || !loc1 || !loc2) return;

      const bounds = L.latLngBounds([loc1, loc2]); // Create bounds for both locations
      map.fitBounds(bounds, { padding: [50, 50] }); // Adjust padding
    }, [map, loc1, loc2]);

    return null;
  };

  const setServiceViewHistory = async (service: Service) => {
    try {
      return await setServiceViewHistoryData(service);
    }
    catch {
      await refreshToken();
      return await setServiceViewHistoryData(service);
    }
  }

  const getAllServices = async () => {
    try {
      return await getAllServicesData();
    }
    catch {
      await refreshToken();
      return await getAllServicesData();
    }
  }

  const search = async () => {
    try {
      return await handleSearch(searchQuery);
    }
    catch {
      await refreshToken();
      return await handleSearch(searchQuery);
    }
  }

  const { data, isLoading, error } = useQuery<QueryProps, Error>({
    queryKey: ['map'],
    queryFn: async () => {
      const allServices = await getAllServices();
      return { allServices };
    }
  });

  useEffect(() => {
    if (searchQuery !== '') {
      const coordinateRegex = /^-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|1[0-7]\d(\.\d+)?|[1-9]?\d(\.\d+)?)$/;
      const isValidCoordinates = (coords: string): boolean => coordinateRegex.test(coords);

      if (isValidCoordinates(searchQuery)) {
        const coordinates = searchQuery?.split(",");
        const latitude = parseFloat(coordinates?.[0]);
        const longitude = parseFloat(coordinates?.[1]);
        setPosition([latitude, longitude]);
        setErrorMessage(undefined);
        search();
      }
      else setErrorMessage("Invalid coordinates. Please enter a valid pair of latitude and longitude in the format: 46.5407099,24.6093423.")
    }
    else {
      setPosition(undefined);
      setSelectedService(undefined);
      setServices([]);
      setErrorMessage(undefined)
    }
  }, [searchQuery, filterValue])


  useEffect(() => {
    if (!data) return;
    setServiceTypes(data?.allServices?.services);
  }, [data])

  if (isLoading) return <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: 9999 }}>
    <CircularProgress color="inherit" />
  </Backdrop>;
  if (error) return toast.error("Could not fetch data");

  return (
    <>
      <div className='map-wrapper2'>
        <div className='map-wrapper2-col-middle search'>
          <div className="search-bar">
            <TextField
              error={errorMessage ? true : false}
              helperText={errorMessage ? errorMessage : 'Please enter a valid pair of latitude and longitude in the format: 46.5407099,24.6093423.'}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PlaceIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment className='search-icon' onClick={async () => isSearchEnabled ? await search() : null} position="end">
                      <SearchIcon />
                    </InputAdornment>
                  )
                },
                inputLabel: {
                  shrink: true
                },
              }}
              placeholder='46.5407099,24.6093423'
              variant="outlined"
              size="small"
              hiddenLabel
              defaultValue={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && isSearchEnabled) await search();
              }}
            />
          </div>
          <div className="filter-chips">
            <img src={'/filter.svg'} alt='Filter icon' />
            {serviceTypes?.map((serviceName) => (
              <Chip
                key={serviceName}
                label={serviceName}
                className={`chip${filterValue?.includes(serviceName) ? ' active' : ''}`}
                onClick={() =>
                  setFilterValue((prev) =>
                    prev.includes(serviceName)
                      ? prev.filter((item) => item !== serviceName)
                      : [...prev, serviceName]
                  )
                }
              />
            ))}
            <Button
              onClick={() => filterValue?.length === serviceTypes?.length ? clearAll() : selectAll()}
              variant='text'
              className='filter-button'
              disableRipple
            >
              {filterValue?.length === serviceTypes?.length ? 'Clear all' : 'Select all'}
            </Button>
          </div>
        </div>
      </div>
      <div className='map-wrapper2'>
        <div className='map-wrapper2-col-left'>
          {position && <>
            <Typography>{`${services?.length} result${services?.length !== 1 ? 's' : ''} found`}</Typography>
            <div className='map-wrapper2-results'>
              {services?.map((service) => (
                <div
                  key={service?.id} 
                  className={`map-wrapper2-result${service?.id === selectedService?.id ? ' active' : ''}`}
                  onClick={() => { 
                    if (service?.id !== selectedService?.id) {
                      setSelectedService(service);
                      setShowPhoneNumber(false);
                    }
                  }}
                >
                  <div className={'account-details-fields-logo map'}>
                    <Avatar src={service?.logo} />
                  </div>
                  <div className='map-wrapper2-result-info'>
                    <Typography className='name'>{service?.name}</Typography>
                    <Typography className='address'>{`${service?.street} ${service?.streetNumber}, ${service?.city}`}</Typography>
                    <Typography className='address'>{`${service?.distance} km`}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
        {position && <div className='map-wrapper2-col-middle map'>
          <div className="map-wrapper">
            <MapContainer center={selectedService ? [selectedService?.latitude, selectedService?.longitude] : position} zoom={13} scrollWheelZoom={true} className="map-container">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                eventHandlers={{
                  click: () => console.log("qqq"),
                }}
                position={position}
                icon={customIconMyLocation}
              />
              {services?.map((service) =>
                <Marker
                  key={service?.id}
                  icon={customIconServiceLocation}
                  opacity={service?.id !== selectedService?.id ? 0.5 : 1}
                  position={[service?.latitude, service?.longitude]}
                  eventHandlers={{
                    click: () => setSelectedService(service),
                  }}
                />
              )}

              {!selectedService && <UpdateMapView coords={position} />}
              {selectedService && <DynamicZoom loc1={position} loc2={[selectedService?.latitude, selectedService?.longitude]} />}
            </MapContainer>
          </div>
        </div>}
        <div className='map-wrapper2-col-right'>
          {(position && selectedService) && <div className="service-card">
            <Typography className='name'>{selectedService?.name}</Typography>
            <Divider className='divider' />
            <Typography className='subline'>Distance from service</Typography>
            <div className='distance-box'>
              <Typography className='distance-box-number'>{selectedService?.distance}</Typography>
              <Typography className='distance-box-km'>km</Typography>
            </div>
            <Divider className='divider' />
            <Typography className='subline'>Contact</Typography>
            <div className='contact'>
              <div>
                <img src="/phone.svg" alt="Phone icon" />
                <Typography className='phone'>
                  {showPhoneNumber
                    ? <span>{selectedService?.phone}</span>
                    : <Button variant='text' onClick={async () => await setServiceViewHistory(selectedService)}>Show phone</Button>
                  }
                </Typography>
              </div>
              <div>
                <img src="/email.svg" alt="Email icon" />
                <Typography>{selectedService?.email}</Typography>
              </div>
            </div>
            <Divider className='divider' />
            <Typography className='subline'>Location</Typography>
            <div className='address'>
              <img src="/location-pin.svg" alt="Location Icon" />
              <div className='address-full'>
                <Typography>{`${selectedService?.street} ${selectedService?.streetNumber}`}</Typography>
                <Typography>{`${selectedService?.county}, ${selectedService?.city}`}</Typography>
                <Typography>{selectedService?.country}</Typography>
              </div>
            </div>
            <Divider className='divider' />
            <Typography className='subline'>Coordinates</Typography>
            <div className='coordinates'>
              <Typography>{selectedService?.latitude?.toFixed(8)}</Typography>
              <Typography>{selectedService?.longitude?.toFixed(8)}</Typography>
            </div>
          </div>}
        </div>
      </div>
    </>
  );
};

export default MapPage;


import React, { lazy, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Autocomplete, Avatar, Backdrop, Badge, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, SnackbarCloseReason, TextField, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from "react-toastify";
import { refreshToken } from "../utils/refreshToken";
import { CheckboxProps, FieldsProps, getAllServicesData, getLogisticManagerData, getLogosticManagerLogo, getServiceProviderData, getServiceProviderLogo, QueryProps, saveAccount } from "../utils/account";
import ComputerDiagnostics from "./home/components/ComputerDiagnostics";
import Towing from "./home/components/Towing";
import Painting from "./home/components/Painting";
import Pti from "./home/components/Pti";
import BodyRepair from "./home/components/BodyRepair";
import ElectricalService from "./home/components/ElectricalService";
import localitati from "../utils/localitati.json";

const Input = lazy(() => import("./home/components/Input"));
const CheckboxField = lazy(() => import("./home/components/Checkbox"));

type Country = {
  code?: string;
  name: string;
};

type County = {
  name: string;
};

type City = {
  id?: number;
  nume: string;
  judet?: string;
  auto?: string;
  zip?: number;
  populatie?: number;
  lat?: number;
  lng?: number;
};

const HomePage = () => {
  const [isLogisticManager, setIsLogisticManager] = useState<boolean | undefined>(undefined);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);

  const [fields, setFields] = useState<FieldsProps>({
    partnerNumber: '',
    fullName: '',
    logo: '',
    phone: '',
    email: '',
    numberOfTrucks: '',
    rating: '',
    state: '',
    address: {
      city: '',
      county: '',
      country: '',
      street: '',
      streetNumber: '',
      latitude: '',
      longitude: ''
    },
    services: []
  });

  const [checkboxes, setCheckboxes] = useState<CheckboxProps[]>([]);
  const [latitudeError, setLatitudeError] = useState<string | undefined>(undefined);
  const [longitudeError, setLongitudeError] = useState<string | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  const countries: Country[] = [{ code: "RO", name: "Romania" }];
  const [selectedCountry, setSelectedCountry] = useState<Country | null>({ code: "RO", name: "Romania" });
  const [counties, setCounties] = useState<County[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const isDisabled = !!latitudeError || !!longitudeError || !!nameError || !!phoneError;

  const checkboxIconsMap: Record<string, React.ReactNode> = {
    'Computer Diagnosis': <ComputerDiagnostics />,
    'Towing': <Towing />,
    'Painting': <Painting />,
    'PTI': <Pti />,
    'Body Repair': <BodyRepair />,
    'Electrical Service': <ElectricalService />,
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFields((prev) => {
          return {
            ...prev,
            logo: reader?.result as string,
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      if (value === "") setNameError("Name field is required")
      else setNameError(undefined)
    }
    if (name === "phone") {
      if (value === "") setPhoneError("Name field is required")
      else setPhoneError(undefined)
    }
    if (name === "address.latitude") {
      const latitudeRegex = /^-?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
      if (!latitudeRegex.test(value)) setLatitudeError("Should match -90 to 90 with optional decimals");
      else setLatitudeError(undefined)
    }
    if (name === "address.longitude") {
      const longitudeRegex = /^-?(180(\.0+)?|((1[0-7]\d)|(\d{1,2}))(\.\d+)?)$/;
      if (!longitudeRegex.test(value)) setLongitudeError("Should match -180 to 180 with optional decimals");
      else setLongitudeError(undefined)
    }

    setFields((prev) => {
      if (name?.startsWith("address.")) {
        const addressKey = name.split(".")[1]; // Extract the nested key
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressKey]: value,
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleStateChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setFields((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCheckboxes((prev) => {
      const updatedCheckobxes = prev?.map((service: CheckboxProps) => {
        if (service?.serviceName === name) return { ...service, checked, principal: !checked ? false : service?.principal }
        else return service;
      })
      return updatedCheckobxes;
    });
  };

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const areThreePrincipalSelected = checkboxes?.filter((checkbox) => checkbox?.principal)?.length > 2;
    if (areThreePrincipalSelected && checked) return toast.warning("Cannot set more than 3 principal services!");
    setCheckboxes((prev) => {
      const updatedCheckobxes = prev?.map((service: CheckboxProps) => {
        if (service?.serviceName === name) return { ...service, principal: checked, checked: checked ? true : service?.checked };
        else return service;
      })
      return updatedCheckobxes;
    });
  };

  const handleSnackbarClose = (_: unknown, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setIsSnackbarOpen(false);
  };

  const getLogisticManager = async () => {
    try {
      return await getLogisticManagerData();
    }
    catch {
      await refreshToken();
      return await getLogisticManagerData();
    }
  }

  const getServiceProvider = async () => {
    try {
      return await getServiceProviderData();
    }
    catch {
      await refreshToken();
      return await getServiceProviderData();
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

  const saveAccountDetails = async () => {
    try {
      return await saveAccount(fields, checkboxes, setIsEdit, selectedCountry?.name, selectedCounty?.name, selectedCity?.nume, isLogisticManager);
    }
    catch {
      await refreshToken();
      return await saveAccount(fields, checkboxes, setIsEdit, selectedCountry?.name, selectedCounty?.name, selectedCity?.nume, isLogisticManager);
    }
  }

  // Extragem județele din fișierul JSON local
  useEffect(() => {
    const countiesSet = new Set(localitati.map((city) => city.judet));
    const countiesArray = Array
      .from(countiesSet)
      .map((countyName) => ({ name: countyName }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCounties(countiesArray);
  }, []);

  // Filtrăm localitățile pe baza județului selectat
  useEffect(() => {
    if (selectedCounty) {
      setLoadingCities(true);
      const filteredCities = localitati.filter((city) => city.judet === selectedCounty.name).sort((a, b) => a.nume.localeCompare(b.nume));
      setCities(filteredCities);
      setLoadingCities(false);
      setFields((prev) => ({ ...prev, address: { ...prev.address, county: selectedCounty?.name, city: selectedCounty?.name === fields?.address?.county ? prev?.address?.city : '' } }))
    } else {
      setCities([]);
      setFields((prev) => ({ ...prev, address: { ...prev.address, county: '', city: '' } }))
    }
  }, [selectedCounty]);

  // Filtrăm localitățile pe baza județului selectat
  useEffect(() => {
    if (selectedCity?.nume) setFields((prev) => ({ ...prev, address: { ...prev.address, city: selectedCity?.nume } }))
  }, [selectedCity]);

  const { data, isLoading, error } = useQuery<QueryProps, Error>({
    queryKey: ['accountDetails'],
    queryFn: async () => {
      const userRole = localStorage.getItem("role");
      const isUserLogisticManager = userRole === "logistic_manager";

      let logisticManagerData: FieldsProps = fields, allServices, serviceProviderData: FieldsProps = fields
      if (isUserLogisticManager) {
        logisticManagerData = await getLogisticManager();
      }
      else {
        [allServices, serviceProviderData] = await Promise.all([
          getAllServices(),
          getServiceProvider(),
          serviceProviderData?.logo && getServiceProviderLogo(serviceProviderData?.logo)
        ]);
      }

      let logisticManagerLogo, serviceProviderLogo;
      if (logisticManagerData?.logo) logisticManagerLogo = await getLogosticManagerLogo(logisticManagerData?.logo);
      if (serviceProviderData?.logo) serviceProviderLogo = await getServiceProviderLogo(serviceProviderData?.logo);

      return { isUserLogisticManager, logisticManagerData, allServices, logisticManagerLogo, serviceProviderData, serviceProviderLogo };
    }
  });

  useEffect(() => {
    if (!data) return;

    setIsLogisticManager(data?.isUserLogisticManager);

    if (data?.isUserLogisticManager) {
      setFields({ ...data?.logisticManagerData, logo: data?.logisticManagerLogo });
      setSelectedCounty({ name: data?.logisticManagerData?.address?.county });
      setSelectedCity({ nume: data?.logisticManagerData?.address?.city });
    }
    else {
      setFields({ ...data?.serviceProviderData, logo: data?.serviceProviderLogo });
      setSelectedCounty({ name: data?.serviceProviderData?.address?.county });
      setSelectedCity({ nume: data?.logisticManagerData?.address?.city });

      const updatedCheckboxes = data?.allServices?.services?.map((serviceName: string) => ({
        serviceName,
        checked: data?.serviceProviderData?.services?.some((s: CheckboxProps) => s?.serviceName === serviceName) || false,
        principal: data?.serviceProviderData?.services?.some((s: CheckboxProps) => s?.serviceName === serviceName && s?.principal) || false
      }));

      setCheckboxes(updatedCheckboxes);
    }
  }, [data]);

  if (isLoading) return <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: 9999 }}>
    <CircularProgress color="inherit" />
  </Backdrop>;
  if (error) return toast.error("Could not fetch data");

  return <>
    <div className="account-details-wrapper">
      <Box className="account-details-fields">
        <div className="account-details-fields-head">
          <Typography className="account-details-fields-title" variant="h4" gutterBottom>
            Account Details
          </Typography>
          <Typography className="account-details-fields-subtitle" variant="h6" gutterBottom>
            Contact details
          </Typography>
          <div className={`account-details-fields-logo${!isEdit ? ' disabled' : ''}`}>
            <input
              accept="image/*"
              type="file"
              id="upload-profile-image"
              onChange={handleImageChange}
            />
            <label htmlFor="upload-profile-image">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                badgeContent={<img src="/logo-upload.svg" alt="Logo upload icon" />}
              >
                <Avatar src={fields?.logo} />
              </Badge>
            </label>
          </div>
        </div>
        <div className="account-details-fields-wrapper">
          <div className="account-details-fields-side">
            <div className="account-details-fields-row">
              <Input label="Company name" name="fullName" value={fields?.fullName} onChange={handleAccountChange} disabled={!isEdit} error={nameError} />
              <Input className="account-details-fields-row-partner-number" label="Partner Number" name="partnerNumber" value={fields?.partnerNumber} onChange={handleAccountChange} disabled={true} />
            </div>
            <div className="account-details-fields-row">
              <Input className="account-details-fields-row-phone" label="Phone" name="phone" value={fields?.phone} onChange={handleAccountChange} disabled={!isEdit} error={phoneError} />
              <Input label="Email" name="email" value={fields?.email} onChange={handleAccountChange} disabled={true} />
            </div>
            <Typography className="account-details-fields-subtitle" variant="h6" gutterBottom>
              Location
            </Typography>
            <div className="account-details-fields-row">
              <Autocomplete
                options={countries}
                getOptionLabel={(option) => option.name}
                value={{ code: "RO", name: "Romania" }}
                onChange={(_, newValue) => setSelectedCountry(newValue)}
                renderInput={(params) => <TextField {...params} label="Țară" />}
                disabled={!isEdit}
                disableClearable
              />
              <Autocomplete
                options={counties}
                value={{ name: fields?.address?.county }}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => setSelectedCounty(newValue)}
                renderInput={(params) => <TextField {...params} label="Selectează Județul" />}
                disableClearable
                disabled={!isEdit}
              />
              <Autocomplete
                options={cities}
                value={{ nume: fields?.address?.city }}
                getOptionLabel={(option) => option?.nume}
                loading={loadingCities}
                disabled={!isEdit || !selectedCounty}
                onChange={(_, newValue) => setSelectedCity(newValue)}
                renderInput={(params) => <TextField {...params} label="Selectează Localitatea" />}
                disableClearable
              />
            </div>
            <div className="account-details-fields-row">
              <Input label="Street" name="address.street" value={fields?.address?.street} onChange={handleAccountChange} disabled={!isEdit} />
              <Input label="Street number" name="address.streetNumber" value={fields?.address?.streetNumber} onChange={handleAccountChange} disabled={!isEdit} />
              <Input label="Latitude" name="address.latitude" value={fields?.address?.latitude} onChange={handleAccountChange} disabled={!isEdit} error={latitudeError} />
              <Input label="Longitude" name="address.longitude" value={fields?.address?.longitude} onChange={handleAccountChange} disabled={!isEdit} error={longitudeError} />
            </div>
            <Typography className="account-details-fields-subtitle" variant="h6" gutterBottom>
              Search settings
            </Typography>
            <div className="account-details-fields-row">
              <FormControl className="account-details-fields-row-state" fullWidth disabled={!isEdit}>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  label="State"
                  value={fields?.state}
                  onChange={handleStateChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Idle">Idle</MenuItem>
                </Select>
              </FormControl>
              {isLogisticManager && <Input className="account-details-fields-row-number-of-trucks" label={"No. of trucks"} name={"numberOfTrucks"} value={fields?.numberOfTrucks} onChange={handleAccountChange} disabled={!isEdit} />}
            </div>
          </div>
        </div>
      </Box>
    </div>
    {!isLogisticManager && <div className="account-details-wrapper">
      <Box className="account-details-fields">
        <Typography className="account-details-fields-title account-details-fields-title-services" variant="h4" gutterBottom>
          Services
        </Typography>
        <Typography className="account-details-fields-subtitle account-details-fields-subtitle-services" variant="h6" gutterBottom>
          Select all the services you provide to your customers and mark the primary ones.
        </Typography>
        <div className="account-details-fields-table">
          <div className="account-details-fields-table-left">
            {checkboxes?.map((service: CheckboxProps) => (
              <div key={service?.serviceName} className="account-details-fields-table-row">
                <div className="account-details-fields-table-column enabled">
                  <Typography className="account-details-fields-table-name" variant="body2">
                    <span className="icon">{checkboxIconsMap?.[service?.serviceName]}</span>
                    {service?.serviceName}
                  </Typography>
                  <CheckboxField name={service?.serviceName} disabled={!isEdit} checked={service?.checked} onChange={handleEnabledChange} label={''} />
                </div>
              </div>
            ))}
          </div>
          <div className="account-details-fields-table-right">
            {checkboxes?.map((service: CheckboxProps) => (
              <div key={service?.serviceName} className="account-details-fields-table-row">
                <div className="account-details-fields-table-column principal">
                  <CheckboxField name={service?.serviceName} disabled={!isEdit} checked={service?.principal} onChange={handlePrincipalChange} label={''} principal />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Box>
    </div>}
    <div className="account-details-submit">
      <div className="account-details-submit-button-wrapper">
        <Button variant="contained" color={isEdit ? 'primary' : 'secondary'} onClick={async () => isEdit ? await saveAccountDetails() : setIsEdit(true)} disabled={isDisabled}>
          {isEdit ? <SaveIcon /> : <EditIcon />}
          {isEdit ? 'Save changes' : 'Edit'}
        </Button>
      </div>
    </div>
    <Snackbar
      open={isSnackbarOpen}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleSnackbarClose} severity="success" variant="filled">
        Changes saved successfully!
      </Alert>
    </Snackbar>
  </>;
}

export default HomePage;
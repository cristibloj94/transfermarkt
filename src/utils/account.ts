import { toast } from "react-toastify";

export const getAllServicesData = async () => {
  const response = await fetch('https://carservice.saas.ascendro.io/api/app/AB00ECEBDB6832BBE1D814F9A7662C0826EADD2D/getServicesList', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await response.json();
  return data;
}

export const getLogisticManagerData = async () => {
  const response = await fetch('https://carservice.saas.ascendro.io/api/app/AB00ECEBDB6832BBE1D814F9A7662C0826EADD2D/getLogisticManager', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await response.json();
  return data;
}

export const getServiceProviderData = async () => {
  const response = await fetch('https://carservice.saas.ascendro.io/api/app/AB00ECEBDB6832BBE1D814F9A7662C0826EADD2D/getServiceProvider', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await response.json();
  return data;
}

export const getServiceProviderLogo = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  return imageUrl;
}

export const getLogosticManagerLogo = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  return imageUrl;
}

export const saveAccount = async (fields: FieldsProps, checkboxes: CheckboxProps[], setIsEdit: React.Dispatch<React.SetStateAction<boolean>>, country?: string, county?: string, city?: string, isLogisticManager?: boolean) => {
  const lat = fields?.address?.latitude;
  const long = fields?.address?.longitude;

  try {
    const services = checkboxes?.filter((service) => service?.checked === true)?.map((service) => ({ principal: service?.principal, serviceName: service?.serviceName }));
    const accountDetails = { ...fields, address: { ...fields?.address, country, county, city, latitude: parseFloat(lat), longitude: parseFloat(long) }, services: isLogisticManager ? undefined : services };
    await fetch(`https://carservice.saas.ascendro.io/api/app/AB00ECEBDB6832BBE1D814F9A7662C0826EADD2D/${isLogisticManager ? 'updateLogisticManager' : 'updateServiceProvider'}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        ...accountDetails
      })
    });

    toast.success(`${isLogisticManager ? 'Logistic manager' : 'Service provider'} updated successfully!`);
    setIsEdit((prev) => !prev)
  }
  catch {
    toast.error(`Error updating ${isLogisticManager ? 'Logistic manager' : 'Service provider'}!`);
  }
}

export type FieldsProps = {
  partnerNumber: string
  fullName: string;
  logo?: string;
  phone: string;
  email: string;
  numberOfTrucks: string;
  rating: string;
  state: string;
  address: {
    city: string;
    county: string;
    country: string;
    street: string;
    streetNumber: string;
    latitude: string;
    longitude: string;
  }
  services: CheckboxProps[]
}

export type CheckboxProps = {
  serviceName: string;
  checked: boolean;
  principal: boolean;
}

export type QueryProps = {
  isUserLogisticManager: boolean;
  logisticManagerData: FieldsProps;
  allServices: {
    services: string[]
  };
  serviceProviderData: FieldsProps;
  serviceProviderLogo?: string;
  logisticManagerLogo?: string;
}
import { Country } from "../enums/country.enum";
import { Titles } from "../enums/titles.enum";

export type UserType = {
  name: string;
  email: string;
  password: string;
  title: Titles;
  day: string;
  month: string;
  year: string;
  newsletter: boolean;
  specialOffers: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  address2?: string;
  country: Country;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
};

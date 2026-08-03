
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

export enum Titles {
  MR = 'Mr.',
  MRS = 'Mrs.',
}

export enum Country {
  INDIA = 'India',
  UNITED_STATES = 'United States',
  CANADA = 'Canada',
  AUSTRALIA = 'Australia',
  ISRAEL = 'Israel',
  NEW_ZEALAND = 'New Zealand',
  SINGAPORE = 'Singapore',
}
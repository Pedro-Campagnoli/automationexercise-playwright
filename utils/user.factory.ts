import { Country } from "../tests/types/user.type";

export interface UserDataProps {
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
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

enum Titles {
  MR = 'Mr.',
  MRS = 'Mrs.',
}
export function createUser() {
  const id = Date.now();

  return {
    name: `Pedro_${id}`,
    email: `pedro_${id}@test.com`,
    password: '1234567',
    title: Titles.MR,
    day: '21',
    month: '5',
    year: '2005',
    newsletter: true,
    specialOffers: true,
    firstName: 'Pedro',
    lastName: 'Ozuka',
    company: 'Grupo DBM',
    address: 'Rua Teste',
    address2: 'Complemento',
    country: Country.INDIA,
    state: 'Paraná',
    city: 'Cianorte',
    zipcode: '87255000',
    mobile: '(44)99999-9999',
  };
}
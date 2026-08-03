import { faker } from "@faker-js/faker";

import { Country } from "../enums/country.enum";
import { Titles } from "../enums/titles.enum";
import { UserType } from "../types/user.type";

export function createUser(): UserType {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // o site é público e compartilhado, então o e-mail precisa ser único mesmo
  // com os testes em paralelo — o faker sozinho pode repetir valores
  const uniqueId = `${Date.now()}${faker.string.numeric(4)}`;
  const emailSlug = firstName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  return {
    // nome sem espaço: o checkLoggedIn compara "Logged in as <name>" exato
    name: firstName,
    email: `${emailSlug}_${uniqueId}@test.com`,
    // só alfanumérico, para não depender de como o site trata caracteres especiais
    password: faker.internet.password({ length: 12, pattern: /[A-Za-z0-9]/ }),
    title: faker.helpers.arrayElement(Object.values(Titles)),
    // os selects de data usam value numérico; dia até 28 evita data inexistente
    day: faker.number.int({ min: 1, max: 28 }).toString(),
    month: faker.number.int({ min: 1, max: 12 }).toString(),
    year: faker.number.int({ min: 1950, max: 2000 }).toString(),
    newsletter: faker.datatype.boolean(),
    specialOffers: faker.datatype.boolean(),
    firstName,
    lastName,
    company: faker.company.name(),
    address: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: faker.helpers.arrayElement(Object.values(Country)),
    state: faker.location.state(),
    city: faker.location.city(),
    // numérico puro: o zipCode/phone do faker pode vir com letra, hífen ou ramal
    zipcode: faker.string.numeric(8),
    mobile: faker.string.numeric({ length: 11, allowLeadingZeros: false }),
  };
}

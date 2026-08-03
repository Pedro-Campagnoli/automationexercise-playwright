import {
  expect,
  type APIRequestContext,
} from "@playwright/test";

import { UserType } from "../types/user.type";

export class AccountApi {
  constructor(
    private readonly request: APIRequestContext,
  ) {}

  async createAccount(user: UserType) {
    const response = await this.request.post("/api/createAccount", {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: user.title,
        birth_date: user.day,
        birth_month: user.month,
        birth_year: user.year,
        firstname: user.firstName,
        lastname: user.lastName,
        company: user.company || "",
        address1: user.address,
        address2: user.address2 || "",
        country: user.country,
        zipcode: user.zipcode,
        state: user.state,
        city: user.city,
        mobile_number: user.mobile,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toMatchObject({
      responseCode: 201,
      message: "User created!",
    });;
  }

  async deleteAccount(
    email: string,
    password: string,
  ) {
    const user = {
    email: email,
    password: password
    }

    const response = await this.request.delete("/api/deleteAccount", {
      form: {
        email: user.email,
        password: user.password,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toMatchObject({
      responseCode: 200,
      message: "Account deleted!",
    });
  };
}



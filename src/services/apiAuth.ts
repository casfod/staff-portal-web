import axios from "axios";

import { PasswordResetTypes, UserType } from "../interfaces.ts";
import { generalApiHeader } from "../utils/generalApiHeader.ts";
import { baseUrl } from "./baseUrl.ts";

const apiURL = baseUrl();
const headers = generalApiHeader();

export const login = async function (email: string, password: string) {
  try {
    const response = await axios.post<UserType>(`${apiURL}/users/login`, {
      email,
      password,
    });

    return response.data;
  } catch (err) {
    // ErrorHandler(err);
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      // Handle other errors
      console.log(err);
    }
  }
};

export const getUser = async function () {
  try {
    const response = await axios.get<UserType>(`${apiURL}/users/me`, {
      headers,
    });

    return response.data;
  } catch (err) {
    // ErrorHandler(err);
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      // Handle other errors
      console.log(err);
    }
  }
};

export const logout = async function () {
  try {
    const response = await axios.get(`${apiURL}/users/logout`);
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const forgotPassword = async function (email: string) {
  try {
    const response = await axios.post<UserType>(
      `${apiURL}/users/forgotPassword`,
      { email: email }
    );
    console.log(response.data);

    return response.data;
  } catch (err) {
    // ErrorHandler(err);
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      // Handle other errors
      console.log(err);
    }
  }
};
export const resetPassword = async function (
  token: string,
  data: PasswordResetTypes
) {
  try {
    const response = await axios.patch<UserType>(
      `${apiURL}/users/resetPassword/${token}`,
      data
    );
    console.log(response.data);

    return response.data;
  } catch (err) {
    // ErrorHandler(err);
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      // Handle other errors
      console.log(err);
    }
  }
};

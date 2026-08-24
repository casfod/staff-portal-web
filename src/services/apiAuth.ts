// src/services/apiAuth.ts
import axios from 'axios';
import { IPasswordForgot, IPasswordReset, IUser, IUserSingleResponse } from '../interfaces';
// import { generalApiHeader } from "../utils/generalApiHeader";
import { baseUrl } from './baseUrl';
import apiClient from './apiClient';

const apiURL = baseUrl();
// const headers = generalApiHeader();

// Auth uses a separate axios instance since it doesn't need the token interceptor
export const login = async function (email: string, password: string) {
  try {
    const response = await axios.post<IUser>(`${apiURL}/auth/login`, {
      email,
      password,
    });

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      console.log(err);
    }
  }
};

export const getUser = async function () {
  try {
    const response = await apiClient.get<IUserSingleResponse>(`${apiURL}/auth/me`);

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      console.log(err);
    }
  }
};

export const logout = async function () {
  try {
    const response = await axios.get(`${apiURL}/auth/logout`);
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const forgotPassword = async function (email: string) {
  try {
    const response = await axios.post<IPasswordForgot>(`${apiURL}/auth/forgot-password`, {
      email: email,
    });

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      console.log(err);
    }
  }
};

export const resetPassword = async function (data: Partial<IPasswordReset>) {
  try {
    const response = await axios.post<IPasswordReset>(`${apiURL}/auth/reset-password/`, data);

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return err.response?.data;
    } else {
      console.log(err);
    }
  }
};

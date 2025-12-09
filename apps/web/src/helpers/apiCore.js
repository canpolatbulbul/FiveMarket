import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// intercepting to capture errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error && error.response) {
      const { status, data } = error.response;
      let message;
      switch (status) {
        case 401:
          message = "Invalid credentials, please check your email/password!";
          break;
        case 403:
          message = "Access Forbidden";
          break;
        case 404:
          message = "Sorry! The data you are looking for could not be found.";
          break;
        case 400:
          // Handle validation errors with field-specific messages
          if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            // Show first validation error message
            message = data.errors[0].message || data.message || "Please check your input and try again.";
          } else {
            message = data?.message || "Please check your input and try again.";
          }
          break;
        case 409:
          message = data?.message || "An account with this email already exists. Please log in instead.";
          break;
        default:
          message =
            data?.message || error.message || "An unknown error occurred.";
      }

      // Create a custom error object to propagate
      const customError = {
        status,
        message,
        data,
        originalError: error,
      };

      return Promise.reject(customError); // Reject with the custom error
    }

    // For cases where there's no response (e.g., network issues)
    return Promise.reject({
      message: error.message || "Network Error",
      originalError: error,
    });
  }
);

const AUTH_SESSION_KEY = "token";

const setAuthorization = (token) => {
  if (token)
    axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
  else delete axiosInstance.defaults.headers.common["Authorization"];
};

const getTokenFromStorage = () => {
  // Check localStorage first (for Remember Me), then sessionStorage
  const token =
    localStorage.getItem(AUTH_SESSION_KEY) ||
    sessionStorage.getItem(AUTH_SESSION_KEY);
  return token ? token : null;
};

class APICore {
  /**
   * Fetches data from given url
   */
  get = (url, params) => {
    let response;
    if (params) {
      var queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
      response = axiosInstance.get(`${url}?${queryString}`, params);
    } else {
      response = axiosInstance.get(`${url}`, params);
    }
    return response;
  };

  /**
   * post given data to url
   */
  post = (url, data, config = {}) => {
    // If data is FormData, don't set Content-Type header at all
    if (data instanceof FormData) {
      const token = getTokenFromStorage();

      // Let the browser set the Content-Type with boundary
      delete axiosInstance.defaults.headers["Content-Type"];

      const requestConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      };

      return axiosInstance.post(url, data, requestConfig);
    }

    // Reset Content-Type for non-FormData requests
    axiosInstance.defaults.headers["Content-Type"] = "application/json";
    return axiosInstance.post(url, data, config);
  };

  /**
   * Updates data
   */
  put = (url, data) => {
    return axiosInstance.put(url, data);
  };

  /**
   * Updates data partially
   */
  patch = (url, data) => {
    return axiosInstance.patch(url, data);
  };

  /**
   * Deletes data
   */
  delete = (url, data) => {
    return axiosInstance.delete(url, data);
  };

  isUserAuthenticated = () => {
    const token = getTokenFromStorage();
    if (!token) {
      return false;
    }
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("access token expired");
      return false;
    } else {
      return true;
    }
  };

  me = () => {
    return axiosInstance.get(`/api/auth/me`);
  };

  storeToken = (token, useLocalStorage = false) => {
    const storage = useLocalStorage ? localStorage : sessionStorage;

    if (token) {
      storage.setItem(AUTH_SESSION_KEY, token);
      // Also remove from the other storage to avoid conflicts
      const otherStorage = useLocalStorage ? sessionStorage : localStorage;
      otherStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      // Clear from both storages
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  };
}

export { APICore, setAuthorization };

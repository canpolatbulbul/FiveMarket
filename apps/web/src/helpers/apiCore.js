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

// Helper function to get default error messages by status code
const getDefaultErrorMessage = (status) => {
  const defaults = {
    400: "Invalid request. Please check your input.",
    401: "Authentication required. Please log in.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This resource already exists.",
    500: "Server error. Please try again later.",
    502: "Bad gateway. The server is temporarily unavailable.",
    503: "Service unavailable. Please try again later.",
  };
  return defaults[status] || "An unexpected error occurred.";
};

// intercepting to capture errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error && error.response) {
      const { status, data } = error.response;

      // Priority: backend message > validation errors > default for status
      let message;

      // Check for validation errors array (e.g., from express-validator)
      if (
        data?.errors &&
        Array.isArray(data.errors) &&
        data.errors.length > 0
      ) {
        message = data.errors[0].message || data.errors[0].msg;
      }

      // Fall back to backend message or error field
      if (!message) {
        message = data?.message || data?.error;
      }

      // Final fallback to default message for status code
      if (!message) {
        message = getDefaultErrorMessage(status);
      }

      // Create a custom error object to propagate
      const customError = {
        status,
        message,
        data,
        originalError: error,
      };

      return Promise.reject(customError);
    }

    // Network or other errors without a response
    return Promise.reject({
      message: error.message || "Network error. Please check your connection.",
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

export { APICore, setAuthorization, getTokenFromStorage };

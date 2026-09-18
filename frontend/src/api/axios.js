// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '/api',
// });

// // Attach the staff member's JWT to every outgoing request, if we have one
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('pharmacy_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // If the token has expired or is invalid, bounce back to login
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('pharmacy_token');
//       localStorage.removeItem('pharmacy_user');
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;




// import axios from "axios";

// const API_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://pharmacy-management-uj3w.onrender.com/api";

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: false,
// });

// export default api;




import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://pharmacy-management-uj3w.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Attach the staff member's JWT to every outgoing request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharmacy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token has expired or is invalid, bounce back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pharmacy_token');
      localStorage.removeItem('pharmacy_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
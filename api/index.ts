import Axios from 'axios';

const urls = {
  test: `http://localhost:3001/`,
  development: 'http://localhost:3001/',
  production: 'https://your-production-url.com/',
};

const api = Axios.create({
  baseURL: urls[process.env.NODE_ENV],
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;

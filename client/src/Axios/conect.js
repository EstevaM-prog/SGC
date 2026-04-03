import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'https://sgc-03ln.onrender.com/api' : 'https://sgc-2-mvsv.onrender.com/api')
});

export const getApiHost = () => {
  return api.defaults.baseURL.replace(/\/api$/, '');
};

export const formatImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `${getApiHost()}${url}`;
  return url;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  try {
    const sessionStr = localStorage.getItem('session_v1');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.accessToken) {
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${session.accessToken}`);
          config.headers.set('X-Access-Token', session.accessToken);
        } else {
          config.headers['Authorization'] = `Bearer ${session.accessToken}`;
          config.headers['X-Access-Token'] = session.accessToken;
        }

        // ENVIO GARANTIDO VIA QUERY STRING PARA MÓDULOS ONDE PROXIES BLOQUEIAM TUDO REDE
        config.params = { ...config.params, token: session.accessToken };
      }
    }

    if (typeof config.headers.set === 'function') {
      config.headers.set('X-Service-ID', import.meta.env.VITE_SERVICE_ID || 'srv-d6vcouc50q8c739im5vg');
    } else {
      config.headers['X-Service-ID'] = import.meta.env.VITE_SERVICE_ID || 'srv-d6vcouc50q8c739im5vg';
    }
  } catch (err) {
    console.error('Erro ao ler sessão:', err);
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = Object.assign({}, originalRequest.headers, {
              Authorization: `Bearer ${token}`,
              'X-Access-Token': token
            });
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const sessionStr = localStorage.getItem('session_v1');
        if (!sessionStr) throw new Error('No session');

        const session = JSON.parse(sessionStr);
        const resp = await axios.post(`${api.defaults.baseURL}/users/refresh`, {
          refreshToken: session.refreshToken
        });

        const { accessToken } = resp.data;
        session.accessToken = accessToken;
        localStorage.setItem('session_v1', JSON.stringify(session));

        processQueue(null, accessToken);
        originalRequest.headers = Object.assign({}, originalRequest.headers, {
          Authorization: `Bearer ${accessToken}`,
          'X-Access-Token': accessToken
        });
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.warn('Sessão expirada. Redirecionando...');
        localStorage.removeItem('session_v1');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
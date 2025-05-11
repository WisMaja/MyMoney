const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export default fetchWithAuth;
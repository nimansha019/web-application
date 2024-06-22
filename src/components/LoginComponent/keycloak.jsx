import Keycloak from 'keycloak-js';
import axios from 'axios';
import qs from 'qs';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'myrealm',
  clientId: 'newclient',
});

export default keycloak;

// Function to get token using email and password
export const getToken = async (username, password) => {
  // Construct the token endpoint explicitly
  const tokenEndpoint = `${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/token`;

  console.log("Constructed token endpoint:", tokenEndpoint);

  const data = {
    grant_type: 'password',
    client_id: keycloak.clientId,
    username,
    password,
  };

  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    url: tokenEndpoint,
  };

  try {
    const response = await axios(options);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token', error);
    return null;
  }
};

// Function to authenticate user using email and password
export const authenticateUser = async (email, password) => {
  try {
    const token = await getToken(email, password);
    if (token) {
      keycloak.token = token;
      console.log('User is authenticated');
      return true;
    } else {
      console.log('User authentication failed');
      return false;
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    return false;
  }
};

// Handle token refresh
keycloak.onTokenExpired = () => {
  console.log('Token expired. Refreshing...');
  keycloak
    .updateToken(30) // Attempt to refresh token (in seconds)
    .then((refreshed) => {
      if (refreshed) {
        console.log('Token refreshed successfully');
      } else {
        console.log('Failed to refresh token or the token is still valid');
      }
    })
    .catch((error) => {
      console.error('Error refreshing token:', error);
    });
};

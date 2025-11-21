import OpenAPIClient from 'openapi-client-axios';
import { Client } from '@/types/api';

const api = new OpenAPIClient({
  definition: `${import.meta.env.VITE_PROJECT_BASEURL}/api/docs.jsonopenapi?format=json`,
  axiosConfigDefaults: {
    withCredentials: true,
  },
});

let client: Client;

export async function getClient() {
  if (client) return client;
  client = await api.init<Client>();
  return client;
}

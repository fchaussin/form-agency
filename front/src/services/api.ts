import OpenAPIClient from 'openapi-client-axios';
// TODO: Find the correct way to import the Client type from openapi-client-axios
// The current build is failing to find the 'Client' type, so using 'any' as a temporary workaround.

const api = new OpenAPIClient({
  definition: `${import.meta.env.VITE_PROJECT_BASEURL}/api/docs.jsonopenapi?format=json`,
  axiosConfigDefaults: {
    withCredentials: true,
  },
});

let client: any;

export async function getClient(): Promise<any> {
  if (client) return client;
  client = await api.init();
  return client;
}


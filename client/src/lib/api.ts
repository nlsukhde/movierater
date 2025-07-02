import axios from "axios"
import { supabase } from "./supabaseClient";


const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
})

// on every request, attach Authorization header if we have a token
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token && config.headers) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api
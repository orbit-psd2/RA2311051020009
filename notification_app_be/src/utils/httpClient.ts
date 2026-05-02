import axios from "axios";
import { config } from "../config/env";

const httpClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default httpClient;

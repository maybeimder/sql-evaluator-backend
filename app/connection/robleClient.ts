// app/connection/robleClient.ts
import axios from "axios";
import * as dotenv from "dotenv";
import type { AxiosInstance } from "axios";

dotenv.config();

// [📘] Deconstruir para TS
const { ROBLE_BASE_DB_URL, ROBLE_DB_NAME, ROBLE_BASE_AUTH_URL ,ROBLE_ACCESS_TOKEN } = process.env;

// Axios para manejar apropiadamente peticiones HTTP
export function robleClient ( mode:"db" | "auth" = "db" ) : AxiosInstance { 
    const baseURL = 
        mode === "auth"
        ? `${ROBLE_BASE_AUTH_URL}/${ROBLE_DB_NAME}`
        : `${ROBLE_BASE_DB_URL}/${ROBLE_DB_NAME}`;

    return axios.create({
        baseURL: baseURL,
        headers: {
            Authorization: `Bearer ${ROBLE_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        }
    })
};

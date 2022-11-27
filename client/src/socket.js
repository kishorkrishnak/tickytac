import io from "socket.io-client";
const isProduction = process.env.NODE_ENV === "production";
const clientUrl = isProduction ? "site.com" : "http://localhost:3001";
export const socket = io(clientUrl);

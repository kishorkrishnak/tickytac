import io from "socket.io-client";
const clientUrl = "http://localhost:3001";
export const socket = io(clientUrl);

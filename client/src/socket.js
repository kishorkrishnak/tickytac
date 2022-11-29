import io from "socket.io-client";
const serverUrl = "https://ticktacker.onrender.com/";
export const socket = io(serverUrl);

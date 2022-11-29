import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./RoomPortal.css";

const RoomPortal = () => {
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Enter your name and room code.", {
      duration: 3000,
    });
  }, []);

  return (
    <div className="portal-wrapper">
      <div className="portal">
        <h1> Create/Join room</h1>
        <div>
          <input
            onChange={(e) => {
              setUsername(e.target.value.trim());
            }}
            type="text"
            placeholder="Enter username"
          />
          <input
            onChange={(e) => {
              setRoomId(e.target.value.trim());
            }}
            type="text"
            placeholder="Enter room code"
          />
        </div>
        <button
          onClick={() => {
            if (!(username && roomId)) {
              toast.error("Username and room id is required");
              return;
            }
            navigate("/multiplayer", {
              state: {
                username,
                roomId,
                from: "/roomportal",
              },
            });
          }}
        >
          Create/Join
        </button>
      </div>
    </div>
  );
};

export default RoomPortal;

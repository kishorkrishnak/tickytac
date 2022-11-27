import { useState } from "react";
import bg from "../../assets/images/bg.jpg";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./RoomPortal.css";
import { useEffect } from "react";
const RoomPortal = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState(null);
  useEffect(() => {
    toast.success("Enter your name and room code.", {
      duration: 3000,
    });
  }, []);
  return (
    <div className="portal-wrapper">
      <img src={bg} alt="" className="portal-wrapper-bg" />
      <div className="portal">
        <h1> Create/Join room</h1>
        <div>
          <input
            onChange={(e) => {
              setUsername(e.target.value.trim());
            }}
            type="text"
            placeholder="Enter username"
            name=""
            id=""
          />
          <input
            onChange={(e) => {
              setRoomId(e.target.value.trim());
            }}
            type="text"
            placeholder="Enter room code"
            name=""
            id=""
          />
        </div>
        <button
          onClick={() => {
            if (!(username && roomId)) {
              toast.error("Username and room id is required :D");
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

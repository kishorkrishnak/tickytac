import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
const Home = () => {
  useEffect(() => {
    setTimeout(() => {
      toast.success("Hello, There!", {
        icon: "👏",
      });
    }, 50);
  }, []);
  const navigate = useNavigate();
  return (
    <>
      <h1
        style={{
          color: "greenyellow",
        }}
      >
        Select Game Mode
      </h1>
      <div className="game-modes-container">
        <div
          className="game-mode-solo"
          onClick={() => {
            navigate("/singleplayer");
          }}
        >
          <h3>Solo</h3>
        </div>
        <div
          className="game-mode-online"
          onClick={() => {
            // toast.error('This mode is in development')
            navigate("/roomportal");
          }}
        >
          <h3>Online</h3>
        </div>
      </div>
    </>
  );
};

export default Home;

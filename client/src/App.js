import "./App.css";
import Home from "./components/pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SinglePlayer from "./components/pages/SinglePlayer";
import MultiPlayer from "./components/pages/MultiPlayer";
import RoomPortal from "./components/pages/RoomPortal";
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <>
          <Routes>
            <Route exact path="/singleplayer" element={<SinglePlayer />} />
            <Route exact path="/multiplayer" element={<MultiPlayer />} />
            <Route exact path="/roomportal" element={<RoomPortal />} />
            <Route exact path="/" element={<Home />} />
          </Routes>
        </>
      </BrowserRouter>
      <Toaster
        toastOptions={{
          duration: 1000,
        }}
        position="top-right"
      ></Toaster>
    </div>
  );
};

export default App;

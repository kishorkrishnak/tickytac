import XImage from "../assets/images/XImage.png";
import OImage from "../assets/images/OImage.png";
import { useState } from "react";
import "./Cell.css";
import toast from "react-hot-toast";
const Cell = ({
  gameState,
  changeCellState,
  id,
  currentTurn,
  username,
  me,
  state,
}) => {
  //state for giving apprporiate backgroundColor for cells
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor:
          gameState.gameOver && gameState.winningCells?.includes(id)
            ? "#1B5E20"
            : isHovering
            ? "#1d2d2d"
            : "#263238",
      }}
      onClick={() => {
        if (state !== "initial" || gameState.gameOver) return;
        if (currentTurn !== username) {
          toast.error("Not your turn!");
          return;
        }
        changeCellState(id, me.mark);
      }}
      className="cell"
    >
      {state !== "initial" && (
        <img src={state === "X" ? XImage : OImage} alt="mark" height={60} />
      )}
    </div>
  );
};

export default Cell;

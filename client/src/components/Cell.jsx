import "./Cell.css";
import XImage from "../assets/images/XImage.png";
import OImage from "../assets/images/OImage.png";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import cellClick from "../assets/audios/cellclick.mp3";
import cellClickError from "../assets/audios/cellclickerror.mp3";
const Cell = ({
  gameState,
  changeCellState,
  id,
  currentTurn,
  userName,
  me,
  state,
  gamemode,
  currentPlayerMark,
  setCurrentPlayerMark,
  setPlayerMoveRequestOnGoing,
  playerMoveRequestOnGoing,
}) => {
  //state for giving apprporiate backgroundColor for cells
  const [isHovering, setIsHovering] = useState(false);

  //only for singleplayer mode
  const [currentMark, setCurrentMark] = useState("");
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  useEffect(() => {
    if (currentMark === "") return;

    changeCellState(id, currentMark);
  }, [currentMark]);
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  if (gamemode === "multiplayer") {
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
          if (state !== "initial" || gameState.gameOver) {
            const audio = new Audio();
            audio.src = cellClickError;
            audio.play();
            return;
          }
          if (currentTurn !== userName) {
            const audio = new Audio();
            audio.src = cellClickError;
            audio.play();
            toast.error("Not your turn!");
            return;
          }

          if (playerMoveRequestOnGoing) {
            return;
          }

          const audio = new Audio();
          audio.src = cellClick;
          audio.play();
          changeCellState(id, me.mark);
          setPlayerMoveRequestOnGoing(true);
        }}
        className="game-grid-cell"
      >
        {state !== "initial" && (
          <img
            src={state === "X" ? XImage : OImage}
            alt="mark"
            className="game-grid-cell-mark"
          />
        )}
      </div>
    );
  } else {
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
          if (currentMark !== "" || gameState.gameOver) {
            const audio = new Audio();
            audio.src = cellClickError;
            audio.play();
            return;
          }

          setCurrentMark(currentPlayerMark);
          const audio = new Audio();
          audio.src = cellClick;
          audio.play();
          if (currentPlayerMark === "X") setCurrentPlayerMark("O");
          else setCurrentPlayerMark("X");
        }}
        className="game-grid-cell"
      >
        {currentMark !== "" && (
          <img
            src={currentMark === "X" ? XImage : OImage}
            alt="xf"
            height={60}
            className="game-grid-cell-mark"
          />
        )}
      </div>
    );
  }
};

export default Cell;

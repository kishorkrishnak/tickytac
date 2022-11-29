import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Cell from "../Cell";
import githubicon from "../../assets/images/github.svg";
import reloadicon from "../../assets/images/reload.svg";
import drawSound from "../../assets/audios/drawsound.mp3";
import winSound from "../../assets/audios/winsound.mp3";

const SinglePlayer = () => {
  //function to find weather X or O should go first
  const randomFirstTurn = () => {
    return Math.floor(Math.random() * 3) === 0 ? "X" : "O";
  };

  const [currentPlayerMark, setCurrentPlayerMark] = useState(randomFirstTurn());

  // initial cell states
  const [cells, setCells] = useState([
    { id: 1, state: "initial" },
    { id: 2, state: "initial" },
    { id: 3, state: "initial" },
    { id: 4, state: "initial" },
    { id: 5, state: "initial" },

    { id: 6, state: "initial" },

    { id: 7, state: "initial" },
    { id: 8, state: "initial" },

    { id: 9, state: "initial" },
  ]);

  // state to keep track of weather game ended,and if so,winners, winning cells
  const [gameState, setGameState] = useState({
    gameOver: false,
    winner: "none",
    winningCells: null,
  });

  //toast to notify which player to go first
  useEffect(() => {
    setTimeout(() => {
      toast.success(`Player ${currentPlayerMark} First!`);
    }, 30);
  }, []);

  //each time a cell state is changed check for win/draw
  useEffect(() => {
    checkForGameState();
  }, [cells]);

  // check win/draw
  const checkForGameState = () => {
    if (compareCellTriplets(cells[0], cells[1], cells[2])) return;
    if (compareCellTriplets(cells[3], cells[4], cells[5])) return;
    if (compareCellTriplets(cells[6], cells[7], cells[8])) return;

    if (compareCellTriplets(cells[0], cells[3], cells[6])) return;

    if (compareCellTriplets(cells[1], cells[4], cells[7])) return;
    if (compareCellTriplets(cells[2], cells[5], cells[8])) return;
    if (compareCellTriplets(cells[0], cells[4], cells[8])) return;
    if (compareCellTriplets(cells[2], cells[4], cells[6])) return;

    const isDraw =
      !gameState.gameOver && cells.every((cell) => cell.state !== "initial");
    if (isDraw) {
      const audio = new Audio();
      audio.src = drawSound;
      audio.play();
      toast.success("Game ended in a draw!");
      setGameState({
        gameOver: true,
        winner: "none",
      });
      return;
    }
  };

  //compare adjacent cells to check for win/draw
  const compareCellTriplets = (cell1, cell2, cell3) => {
    if (
      cell1.state === cell2.state &&
      cell2.state === cell3.state &&
      cell1.state !== "initial"
    ) {
      const winner = cell1.state.toUpperCase();
      toast.success(`Player ${winner} wins! 🏆`);
      const audio = new Audio();
      audio.src = winSound;
      audio.play();

      setGameState({
        gameOver: true,
        winner,
        winningCells: [cell1.id, cell2.id, cell3.id],
      });
      return true;
    } else return false;
  };

  //function to change a cells state by id;passed to each cell
  const changeCellState = (id, newstate) => {
    const updatedcells = cells.map((cell) => {
      if (cell.id === id) {
        return { ...cell, state: newstate };
      }

      return cell;
    });

    setCells(updatedcells);
  };

  return (
    <>
      <div className="game-wrapper">
        <h1 className="game-title">
          {gameState.gameOver
            ? gameState.winner === "none"
              ? "Draw"
              : `Player ${gameState.winner} Wins 🥇`
            : "Tic Tac Toe"}
        </h1>
        <div className="game-grid">
          {cells.map((cell) => (
            <Cell
              gameState={gameState}
              id={cell.id}
              changeCellState={changeCellState}
              setCurrentPlayerMark={setCurrentPlayerMark}
              currentPlayerMark={currentPlayerMark}
              key={cell.id}
            />
          ))}
        </div>
        <img
          className="reload-button"
          onClick={() => {
            window.location.reload();
          }}
          src={reloadicon}
          height={40}
          alt="reload icon"
        />
        <footer className="credits-div">
          <h4 className="credits">
            <img src={githubicon} alt="github icon" />
            <a href="https://github.com/ExoticFormula"> ExoticFormula </a>
          </h4>
        </footer>
      </div>
    </>
  );
};

export default SinglePlayer;

import "./MultiPlayer.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { socket } from "../../socket";
import { BallTriangle } from "react-loading-icons";
import githubicon from "../../assets/images/github.svg";
import player1 from "../../assets/images/player1.svg";
import player2 from "../../assets/images/player2.svg";
import Cell from "../Cell";
import gameBeginSound from "../../assets/audios/entergame.wav";
import winSound from "../../assets/audios/winsound.mp3";
import loseSound from "../../assets/audios/losesound.mp3";
import drawSound from "../../assets/audios/drawsound.mp3";


import backbutton2 from "../../assets/images/backbutton2.svg";
import { useRef } from "react";

const MultiPlayer = () => {
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

  //reset all cell to unmarked and clear the game state
  const resetGame = () => {
    setCells([
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

    setGameState({
      gameOver: false,
      winner: "none",
      winningCells: null,
    });
  };

  // state to keep track of weather game ended,and if so,winners, winning cells
  const [gameState, setGameState] = useState({
    gameOver: false,
    winner: "none",
    winningCells: null,
  });

  const [players, setPlayers] = useState([]);
  const playersRef = useRef(players);
  const [opponent, setOpponent] = useState(null);
  const [me, setMe] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("");
  const [startGame, setStartGame] = useState(false);
  const [titleText, setTitleText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  //function to clear location and its state history
  const clearHistory = () => {
    window.history.replaceState({}, document.title);
  };

  //go back to room portal on lost connection
  const handleConnectionLost = () => {
    setTimeout(() => {
      toast.error("Connection lost, going back :(");
      setTimeout(() => {
        navigate("/roomportal");
      }, 1000);
    }, 30);
  };

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
      socket.emit("restart-game");
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
      const winner = currentTurn;
      const audio = new Audio();
      audio.src = currentTurn === me.name ? winSound : loseSound;
      audio.play();

      socket.emit("increase-score-and-restart", currentTurn);
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
    socket.emit("player-move", { cells, id, newstate });
  };

  useEffect(() => {
    if (players && players.length > 0) {
      playersRef.current = players;
      const username = location.state.username;
      const opponent = players[0].name !== username ? players[0] : players[1];

      const me = players[0].name === username ? players[0] : players[1];
      setMe(me);
      setOpponent(opponent);
    }
  }, [players]);

  useEffect(() => {
    if (startGame) {
      const titleText = `${me?.score} Vs ${opponent?.score}`;
      setTitleText(titleText);
      const audio = new Audio();
      audio.src = gameBeginSound;

      audio.play();
      setTimeout(() => {
        if (currentTurn === me.name) {
          toast.success(`Your turn first!`);
        } else {
          toast.success(`Player ${currentTurn} goes first!`);
        }
      }, 30);
    }
  }, [opponent, me]);

  useEffect(() => {
    checkForGameState();
  }, [cells]);

  useEffect(() => {
    if (location.state && location.state.from === "/roomportal") {
      socket.emit("create-or-join-room", {
        username: location.state.username,
        roomId: location.state.roomId,
      });

      clearHistory();
    } else {
      clearHistory();
      handleConnectionLost();
    }

    socket.on("start-game", ({ players, firstTurn }) => {
      setStartGame(true);

      setPlayers(players);
      playersRef.current = players;

      setCurrentTurn(firstTurn);
    });

    socket.on("terminate-session", () => {
      handleConnectionLost();
    });

    socket.on("toggle-turn", () => {
      let players = playersRef.current;
      if (!gameState.gameOver) {
        setCurrentTurn((prevTurn) =>
          prevTurn === players[0].name ? players[1].name : players[0].name
        );
      }
    });

    socket.on("restart-game", ({ firstTurn, players }) => {
      toast.success("Next round begins in 5 seconds", {
        duration: 5000,
      });
      setTimeout(() => {
        resetGame();
        setPlayers([...players]);
        playersRef.current = players;

        setCurrentTurn(firstTurn);
      }, 5000);
    });
    socket.on("room-created", () => {
      setTimeout(() => {
        toast.success("Room created! ask your friend to join!");
      }, 200);
    });
    socket.on("room-full", () => {
      toast.error("Room full, cannot join");
    });
    socket.on("increase-score-and-restart", ({ players, firstTurn }) => {
      toast.success("Next round begins in 5 seconds", {
        duration: 5000,
      });
      setTimeout(() => {
        resetGame();
        setPlayers([...players]);

        setCurrentTurn(firstTurn);
      }, 5000);
    });

    socket.on("player-move", (updatedcells) => {
      setCells([...updatedcells]);
    });

    //cleanup listeners
    return () => {
      socket.off("room-created");
      socket.off("room-full");
      socket.off("start-game");
      socket.off("terminate-session");
      socket.off("player-move");
      socket.off("toggle-turn");
      socket.off("increase-score-and-restart");
      socket.off("restart-game");
    };
  }, []);

  return (
    <>
      {startGame &&
      players &&
      me &&
      titleText &&
      currentTurn &&
      players.length > 0 ? (
        <div className="game-wrapper">
          <h1 className="game-header">
            <div className="game-header-player">
              <img
                className="avatar"
                src={me.priority === "player1" ? player1 : player2}
                alt="player1 avatar"
                style={{
                  border:
                    currentTurn === me.name && !gameState.gameOver
                      ? "4px solid gold"
                      : "none",

                  boxShadow:
                    currentTurn === me.name && !gameState.gameOver
                      ? "0px 0px 15px gold"
                      : "none",
                  filter:
                    currentTurn !== me.name && !gameState.gameOver
                      ? "brightness(50%)"
                      : "none",
                }}
              />
              <p className="game-header-playername">{me.name}</p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!gameState.gameOver && (
                <p className="game-header-score">{titleText}</p>
              )}
              {gameState.gameOver && gameState.winner === "none" && "Draw"}
              {gameState.gameOver && gameState.winner !== "none" && (
                <p className="game-header-winner">
                  {gameState.winner === me.name
                    ? "You Win 🥇"
                    : `You lost :(`}
                </p>
              )}

              {!gameState.gameOver && (
                <p className="game-header-turn">
                  {currentTurn === me.name ? "Your Turn" : "Their Turn"}
                </p>
              )}
            </div>
            <div className="game-header-player">
              <img
                className="avatar"
                style={{
                  border:
                    currentTurn !== me.name && !gameState.gameOver
                      ? "4px solid gold"
                      : "none",
                  boxShadow:
                    currentTurn !== me.name && !gameState.gameOver
                      ? "0px 0px 15px gold"
                      : "none",
                  filter:
                    currentTurn === me.name && !gameState.gameOver
                      ? "brightness(50%)"
                      : "none",
                }}
                src={me.priority === "player2" ? player1 : player2}
                alt="player2 avatar"
              />
              <p className="game-header-playername">{opponent.name}</p>
            </div>
          </h1>
          <div className="game-grid">
            {cells.map((cell) => (
              <Cell
                gamemode="multiplayer"
                currentTurn={currentTurn}
                gameState={gameState}
                id={cell.id}
                changeCellState={changeCellState}
                userName={me.name}
                key={cell.id}
                me={me}
                state={cell.state}
              />
            ))}
          </div>
          <img
            onClick={() => {
              window.location.reload();

              clearHistory();
            }}
            src={backbutton2}
            height={40}
            alt="reload icon"
            className="reload-button"
          />
          <footer className="credits-div">
            <h4 className="credits">
              <img src={githubicon} alt="github icon" onClick={() => {}} />
              <a href="https://github.com/ExoticFormula"> ExoticFormula </a>
            </h4>
          </footer>
        </div>
      ) : (
        <>
          <BallTriangle></BallTriangle>
          <h1 className="game-waitingtext">Waiting for a player...</h1>
          {location?.state?.roomId && (
            <h2 className="game-roomid">
              ROOM ID: <span>{location.state.roomId}</span>
            </h2>
          )}
        </>
      )}
    </>
  );
};

export default MultiPlayer;

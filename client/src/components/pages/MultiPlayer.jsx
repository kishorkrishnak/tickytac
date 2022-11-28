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
import reloadicon from "../../assets/images/reload.svg";
import gameBeginSound from "../../assets/audios/entergame.wav";
import winSound from "../../assets/audios/winsound.mp3";

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

  // state to keep track of weather game ended,and if so,winners, winning cells
  const [gameState, setGameState] = useState({
    gameOver: false,
    winner: "none",
    winningCells: null,
  });

  const [players, setPlayers] = useState([]);
  const [userName, setUserName] = useState(null);
  const [opponentName, setOpponentName] = useState("");
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

    let isDraw =
      !gameState.gameOver && cells.every((cell) => cell.state !== "initial");

    if (isDraw) {
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
      let winner = currentTurn.toUpperCase();
      toast.success(`${winner} wins!`);
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
    socket.emit("player-move", { cells, id, newstate });
    socket.emit("toggle-turn", players);
  };

  //reset game to original state
  const resetGame = () => {};

  useEffect(() => {
    if (players && players.length > 0) {
      let me = players[0].name === userName ? players[0] : players[1];
      setMe(me);
    }
  }, [players]);

  useEffect(() => {
    if (location.state && location.state.from === "/roomportal") {
      setUserName(location.state.username);
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
      setPlayers(players);
      let username = location.state.username;
      let opponent = players[0].name !== username ? players[0] : players[1];

      let me = players[0].name === username ? players[0] : players[1];
      setMe(me); // let me = players[0].name === userName ? players[0] : players[1];
      setOpponentName(opponent.name);
      setCurrentTurn(firstTurn);
      let titleText = `${me?.score} Vs ${opponent?.score}`;
      setTitleText(titleText);
      setStartGame(true);
      const audio = new Audio();
      audio.src = gameBeginSound;
      audio.play();

      // toast to notify which player to go first
      setTimeout(() => {
        toast.success(`Player ${currentTurn} First!`);
      }, 30);
    });

    socket.on("terminate-session", () => {
      handleConnectionLost();
    });

    socket.on("toggle-turn", (players) => {
      setCurrentTurn((prevTurn) =>
        prevTurn === players[0].name ? players[1].name : players[0].name
      );
    });

    socket.on("room-created", () => {
      setTimeout(() => {
        toast.success("Room created! ask your friend to join!");
      }, 200);
    });
    socket.on("room-full", () => {
      toast.error("Room full, cannot join");
    });

    socket.on("player-move", (updatedcells) => {
      setCells([...JSON.parse(JSON.stringify(updatedcells))]);
    });

    //cleanup listeners
    return () => {
      socket.off("room-created");
      socket.off("room-full");
      socket.off("start-game");
      socket.off("terminate-session");
      socket.off("player-move");
      socket.off("toggle-turn");
    };
  }, []);

  useEffect(() => {
    checkForGameState();
  }, [cells]);

  return (
    <>
      {startGame &&
      players &&
      me &&
      titleText &&
      currentTurn &&
      players.length > 0 ? (
        <div className="main-container">
          <h1 className="game-title">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <img
                src={me.priority === "player1" ? player1 : player2}
                alt="player1 avatar"
                height={80}
                style={{
                  border:
                    currentTurn === userName && !gameState.gameOver
                      ? "1px solid gold"
                      : "none",
                }}
              />
              <span>{userName}</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {gameState.gameOver
                ? gameState.winner === "none"
                  ? "Draw"
                  : `${gameState.winner} Wins 🥇`
                : `${titleText}`}

              {currentTurn === userName && !gameState.gameOver ? (
                <h6>Your Turn</h6>
              ) : (
                <h6>Their Turn</h6>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <img
                style={{
                  border:
                    currentTurn !== userName && !gameState.gameOver
                      ? "1px solid gold"
                      : "none",
                }}
                src={me.priority === "player2" ? player1 : player2}
                alt="player2 avatar"
                height={80}
              />
              <span>{opponentName}</span>
            </div>
          </h1>
          <div className="game-container">
            {cells.map((cell) => (
              <Cell
                currentTurn={currentTurn}
                gameState={gameState}
                id={cell.id}
                changeCellState={changeCellState}
                username={userName}
                key={cell.id}
                me={me}
                state={cell.state}
              />
            ))}
          </div>
          <img
            onClick={() => {
              window.location.reload();
            }}
            src={reloadicon}
            height={40}
            alt="reload icon"
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
          <h1
            style={{
              marginTop: 15,
            }}
          >
            Waiting for another player to join
          </h1>
        </>
      )}
    </>
  );
};

export default MultiPlayer;

import "./SinglePlayer.css";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { socket } from "../../socket";
import Cell from "../Cell";
import githubicon from "../../assets/images/github.svg";
import reloadicon from "../../assets/images/reload.svg";

const MultiPlayer = () => {
    const [startGame, setStartGame] = useState(false);
    //function to find weather X or O should go first
    const randomFirstTurn = () => {
        return Math.floor(Math.random() * 3) === 0 ? "X" : "O";
    };
    useEffect(() => {
        socket.on("invalid-room", () => {
            toast.error("Room doesnt exist");
        });

        socket.on("room-created", () => {
            toast.error("Room created! ask your friend to join!");
        });
        socket.on("room-full", () => {
            toast.error("Room full, cannot join");
        });
        socket.on("fire", () => {
            toast.success("fired");
        });

        socket.on("start-game", () => {
            setStartGame(true);
            toast.success("Lets gooo");
        });
    }, []);

    const [currentUserIcon, setCurrentUserIcon] = useState(randomFirstTurn());

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
            toast.success(`Player ${currentUserIcon} First!`);
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
            let winner = cell1.state.toUpperCase();
            toast.success(`Player ${winner} wins!`);
            setGameState({
                gameOver: true,
                winner,
                winningCells: [cell1.id, cell2.id, cell3.id],
            });
            return true;
        } else return false;
    };
    const [roomId, setRoomId] = useState(null);
    const [username, setUsername] = useState(null);

    //function to change a cells state by id;passed to each cell
    const changeCellState = (id, newstate) => {
        let updatedcells = cells.map((cell) => {
            if (cell.id === id) {
                return { ...cell, state: newstate };
            }

            return cell;
        });

        setCells(updatedcells);
    };

    if (startGame) {
        return (
            <>
                <h4>{username}</h4>
                <div className="main-container">
                    <h1
                        onClick={() => {
                            socket.emit("fire");
                        }}
                        className="game-title"
                    >
                        {gameState.gameOver
                            ? gameState.winner === "none"
                                ? "Draw"
                                : `Player ${gameState.winner} Wins`
                            : "Tic Tac Toe"}
                    </h1>
                    <div className="game-container">
                        {cells.map((cell) => (
                            <Cell
                                gameState={gameState}
                                id={cell.id}
                                changeCellState={changeCellState}
                                setCurrentUserIcon={setCurrentUserIcon}
                                currentUserIcon={currentUserIcon}
                                key={cell.id}
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
                            <img src={githubicon} alt="github icon" />
                            <a href="https://github.com/ExoticFormula"> ExoticFormula </a>
                        </h4>
                    </footer>
                </div>
            </>
        );
    } else {
        return (
            <>
                <label htmlFor="Join Room">Create\Join room</label>
                <br />
                <input
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter username"
                    name=""
                    id=""
                />
                <br />
                <input
                    onChange={(e) => {
                        setRoomId(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter room code"
                    name=""
                    id=""
                />
                <br />
                <button
                    onClick={() => {
                        if (!(username && roomId)) {
                            toast.error("Username and room id is required");
                            return;
                        }
                        socket.emit("create-or-join-room", {
                            username,
                            roomId,
                        });
                    }}
                >
                    Create
                </button>
            </>
        );
    }
};

export default MultiPlayer;

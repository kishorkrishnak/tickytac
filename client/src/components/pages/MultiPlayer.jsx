import "./SinglePlayer.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { socket } from "../../socket";
import Cell from "../Cell";
import githubicon from "../../assets/images/github.svg";
import { useNavigate } from 'react-router-dom'
import { BallTriangle } from 'react-loading-icons'
import reloadicon from "../../assets/images/reload.svg";
import gameBeginSound from '../../assets/audios/entergame.wav'
const MultiPlayer = () => {
    const navigate = useNavigate()

    const location = useLocation()
    const [startGame, setStartGame] = useState(false);
    //function to find weather X or O should go first
    const randomFirstTurn = () => {
        return Math.floor(Math.random() * 3) === 0 ? "X" : "O";
    };
    const clearHistory = () => {
        window.history.replaceState({}, document.title)

    }
    const [titleText, setTitleText] = useState('')
    useEffect(() => {

        if (location.state && location.state.from === '/roomportal') {
            socket.emit("create-or-join-room", {
                username: location.state.username,
                roomId: location.state.roomId,
            });

            clearHistory()

        } else {
            clearHistory()

            socket.emit('connection-lost')

        }

        socket.on("invalid-room", () => {
            toast.error("Room doesnt exist");
        });

        socket.on('connection-lost', () => {
            setTimeout(() => {
                toast.error('Connection lost, going back :(')
                setTimeout(() => {
                    navigate('/roomportal')

                }, 1000)
            }, 30)
        })
        socket.on("room-created", () => {
            toast.error("Room created! ask your friend to join!");
        });
        socket.on("room-full", () => {
            toast.error("Room full, cannot join");
        });

        socket.on("start-game", (usernames) => {
            setTitleText(usernames.join(' X ').toUpperCase())
            setStartGame(true);
            const audio = new Audio()
            audio.src = gameBeginSound
            audio.play()

            //toast to notify which player to go first

            setTimeout(() => {
                toast.success(`Player ${currentUserIcon} First!`);
            }, 30);
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
                <div className="main-container">
                    <h1

                        className="game-title"
                    >
                        {gameState.gameOver
                            ? gameState.winner === "none"
                                ? "Draw"
                                : `Player ${gameState.winner} Wins`
                            : `${titleText}`}
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
                <BallTriangle></BallTriangle>
                <h1 style={{
                    marginTop: 15
                }}>Waiting for another player to join</h1>
            </>

        )
    }
};

export default MultiPlayer;

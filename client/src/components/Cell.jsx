import XImage from '../assets/images/XImage.png'
import OImage from '../assets/images/OImage.png'
import { useState } from 'react'
import { useEffect } from 'react'
import './Cell.css'
const Cell = ({ gameState, currentUserIcon, setCurrentUserIcon, changeCellState, id }) => {
    const [currentIcon, setCurrentIcon] = useState('')

    useEffect(() => {
        if (currentIcon === '') return

        changeCellState(id, currentIcon)
    }, [currentIcon])
    return (
        <div style={{

            backgroundColor: gameState.gameOver && gameState.winningCells?.includes(id) ? "#1B5E20" : " #263238"
        }} onClick={() => {
            if (currentIcon !== '' || gameState.gameOver) return
            setCurrentIcon(currentUserIcon)

            if (currentUserIcon === "X")
                setCurrentUserIcon('O')
            else
                setCurrentUserIcon('X')

        }} className="cell">
            {currentIcon !== '' && <img src={currentIcon === 'X' ? XImage : OImage} alt="xf" height={60} />}
        </div>
    )
}

export default Cell
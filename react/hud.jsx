import React, { useContext } from 'react'
import FPS from './fps'
import { GameContext } from './game-interop'
import styles from './hud.css'

export default function HUD(props) {
  const { gameState } = useContext(GameContext)

  return (
    <div className={styles.container}>
      <FPS />
      <div>
        {gameState.selectedActor &&
        <span>{gameState.selectedActor.data.values.type} {gameState.selectedActor.data.values.resourceAmount}</span>
        }
      </div>
    </div>
  )
}

import doodads from '../res/sprites/doodads/*.png'
import { GameObjects, Math } from 'phaser'

export class Doodad extends GameObjects.Sprite {
  constructor(scene) {
    super(scene, 0, 0, 'speed')

    scene.add.existing(this)
    scene.groups.doodads.add(this)

    this.setDepth(0)
  }

  update(time, delta) {
    this.angle += this.rotationSpeed * (delta / 1000)
  }

  spawn(x, y) {
    const doodadIndex = Math.Between(0, Object.keys(doodads).length - 1)
    this.doodadKey = Object.keys(doodads)[doodadIndex]

    this.setAlpha(1)
    this.setAngle(0)
    this.setPosition(x, y)
    this.setScale(1, 1)
    this.setTexture(this.doodadKey)
    this.setActive(true)
    this.setVisible(true)

    switch (this.doodadKey) {
      case 'meteor1':
      case 'meteor2':
      case 'meteor3':
      case 'meteor4':
        this.setAngle(Math.FloatBetween(0, 360))
        this.setScale((((this.speed - 60) / 60) * 0.25) + 0.75)
        this.rotationSpeed = Math.FloatBetween(-60, 60)
        break

      case 'star1':
      case 'star2':
      case 'star3':
        this.setAlpha(0.5)
        this.setAngle(Math.FloatBetween(0, 360))
        this.setScale(0.25)
        this.rotationSpeed = 0
        break
    }
  }
}

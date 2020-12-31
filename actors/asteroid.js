import { GameObjects, Math } from 'phaser'

export class Asteroid extends GameObjects.Sprite {
  constructor(scene, x, y, type, size) {
    super(scene, x, y, 'asteroid')

    scene.physics.world.enable(this)
    scene.add.existing(this)
    scene.groups.asteroids.add(this)

    this.asteroidData = scene.dataController.asteroids.find(asteroid => asteroid.type === type)
    
    Object.keys(this.asteroidData).forEach((key) => {
      this.setData(key, this.asteroidData[key])
    })
    this.setData('resourceAmount', Math.Linear(this.getData('resourceRange')[0], this.getData('resourceRange')[1], size))

    this.rotateSpeed = Math.FloatBetween(-0.25, 0.25)
    this.updateScale()
    this.setData('behaviors', [])
    this.setDepth(1)
    this.setInteractive()
    this.tint = this.getData('color')

    this.on('pointerdown', () => {
      this.scene.data.set('selectedActor', this)
    }, this)
  }

  mine() {
    this.incData('resourceAmount', -1)
    this.updateScale()

    return {
      type: this.asteroidData.type,
      amount: 1
    }
  }

  updateScale() {
    this.scale = this.getData('resourceAmount') / this.getData('resourceRange')[1]
  }

  update(time, delta) {
    if (this.getData('resourceAmount') <= 0) {
      this.destroy()
    }

    this.rotation += (delta / 1000) * this.rotateSpeed

    if (this.data.get('behaviors').length) {
      this.data.get('behaviors').forEach(behavior => behavior.update(time, delta))
    }
  }
}

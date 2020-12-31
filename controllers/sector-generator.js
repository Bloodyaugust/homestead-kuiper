import { GameObjects, Math } from 'phaser'
import { Noise } from 'noisejs';
import Chance from 'chance'
import { Asteroid } from '../actors/asteroid'

const asteroidFloor = 0.25
const asteroidGeometryModifier = [0.6, 0]
const noAsteroidFrequency = [-200, 750]
const gridCellSize = 100
const gridColumns = 12
const gridRows = 8

export class SectorGeneratorController {
  constructor(scene) {
    this.scene = scene

    this.seed = 45106
    this.asteroidChance = new Chance(this.seed)
    this.asteroidNoise = new Noise()
    this.asteroidNoise.seed(this.seed)

    this.sectorFolder = scene.datGUI.addFolder('Sector Generation')
    this.sectorFolder.add(this, 'seed', 0, 65536, 1).onFinishChange(() => this.generateSector()).listen()
    this.sectorFolder.add({
      randomize: () => {
        this.seed = Math.Between(0, 65536)
        this.generateSector()
      }
    }, 'randomize')

    this.generateSector()
  }

  generateSector() {
    this.scene.groups.asteroids.clear(true, true)

    this.asteroidChance = new Chance(this.seed)
    this.asteroidNoise.seed(this.seed)

    const fieldGeometry = {
      type: 'circle',
      geometry: this.scene.add.arc(
        this.asteroidChance.integer({
          min: -600,
          max: 600
        }),
        this.asteroidChance.integer({
          min: -400,
          max: 400
        }),
        this.asteroidChance.integer({
          min: 250,
          max: 450
        }),
      )
    }
    this.scene.groups.asteroids.add(fieldGeometry.geometry)

    for (let x = -gridColumns; x < gridColumns; x++) {
      for (let y = -gridRows; y < gridRows; y++) {
        const noiseValue = Math.Clamp((this.asteroidNoise.perlin2(x / 4, y / 3) + 1) / 2 + Math.Linear(asteroidGeometryModifier[0], asteroidGeometryModifier[1], Math.Clamp(Math.Distance.Between(fieldGeometry.geometry.x, fieldGeometry.geometry.y, x * gridCellSize, y * gridCellSize) / fieldGeometry.geometry.radius, 0, 1)), 0, 1)
        const computedNoAsteroidFrequency = Math.Linear(noAsteroidFrequency[0], noAsteroidFrequency[1], Math.Clamp(Math.Distance.Between(fieldGeometry.geometry.x, fieldGeometry.geometry.y, x * gridCellSize, y * gridCellSize) / fieldGeometry.geometry.radius, 0, 1))
        console.log(Math.Distance.Between(fieldGeometry.geometry.x, fieldGeometry.geometry.y, x * gridCellSize, y * gridCellSize), computedNoAsteroidFrequency)
        const asteroidType = this.asteroidChance.weighted(['none', ...this.scene.dataController.asteroids.map(asteroid => asteroid.type)], [computedNoAsteroidFrequency, ...this.scene.dataController.asteroids.map(asteroid => asteroid.frequency)])

        if (noiseValue >= asteroidFloor && asteroidType !== 'none') {
          new Asteroid(this.scene, x * gridCellSize + this.asteroidChance.floating({min: -gridCellSize / 4, max: gridCellSize / 4}), y * gridCellSize + this.asteroidChance.floating({min: -15, max: 15}), asteroidType, noiseValue)
        }
      }
    }
  }

  update() {}
}

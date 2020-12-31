import { Math, Scene } from 'phaser'
import { DataController } from '../controllers/data-controller'
import { DoodadSpawnerController } from '../controllers/doodad-spawner'
import { SectorGeneratorController } from '../controllers/sector-generator'
import asteroid from '../res/sprites/asteroid.png'
import backgrounds from '../res/backgrounds/*.png'
import doodads from '../res/sprites/doodads/*.png'
import particles from '../res/sprites/particles/*.png'
import sfx from '../res/sfx/*.ogg'
import { GameState } from '../constants/game-state'
import * as dat from 'dat.gui'

export class MainScene extends Scene {
  constructor() {
    super({
      data: {},
      key: 'MainScene'
    })
  }

  preload() {
    this.load.image('asteroid', asteroid)

    this.load.image('layer1', backgrounds.layer1)

    Object.keys(doodads).forEach((doodadKey) => {
      this.load.image(doodadKey, doodads[doodadKey])
    })
    Object.keys(particles).forEach((particleKey) => {
      this.load.image(particleKey, particles[particleKey])
    })

    this.load.audio('explosion', sfx.explosion)
  }
  
  create() {
    this.groups = {
      asteroids: this.physics.add.group({name: 'asteroids', runChildUpdate: true}),
      doodads: this.add.group({name: 'doodads', runChildUpdate: true})
    }

    this.datGUI = new dat.GUI({
      name: 'Dev Tools'
    })

    this.cursorKeys = this.input.keyboard.createCursorKeys()

    this.dataController = new DataController(this)
    this.controllers = [
      this.dataController,
      new SectorGeneratorController(this),
      new DoodadSpawnerController(this)
    ]

    this.backgrounds = []
    this.backgrounds.push(this.add.tileSprite(400, 300, this.game.config.width, this.game.config.height, 'layer1').setScrollFactor(0).setDepth(-1))

    this.data.events.on('changedata', (parent, key, value, previousValue) => {
      window.dispatchEvent(new CustomEvent('gameStateChanged', {
        detail: {...this.data.values}
      }))

      if (key === 'game') {
        switch (value) {
          case GameState.GAME_OVER:
            if (this.data.get('view') === GameState.VIEW_GAME_HUD) {
              this.scene.restart()
            }
            break

          case GameState.GAME_PAUSED:
            this.scene.pause('MainScene')
            break
          
          case GameState.GAME_PLAYING:
            this.scene.resume('MainScene')
            break
        }
      }
    }, this)

    this.data.events.on('setdata', (parent, key, value) => {
      window.dispatchEvent(new CustomEvent('gameStateChanged', {
        detail: {...this.data.values}
      }))
    }, this)

    this.data.set('game', GameState.GAME_PLAYING)
    this.data.set('view', GameState.VIEW_GAME_HUD)

    window.dispatchEvent(new CustomEvent('mainSceneCreated', {
      detail: {
        scene: this
      }
    }))

    this.events.once('shutdown', () => {
      this.data.events.off('setdata')
      this.data.events.off('changedata')
    }, this)

    this.cameraTarget = this.add.circle(0, 0, 16).setStrokeStyle(2, 0xff0000)
    
    document.addEventListener('wheel', (event) => {
      this.cameras.main.zoom = Math.Clamp(this.cameras.main.zoom - ((event.deltaY / 100) * 0.05), 0.25, 1)
    })
    this.cameras.main.zoom = 0.25
    this.cameras.main.startFollow(this.cameraTarget, false)
  }

  update(time, delta) {
    window.dispatchEvent(new CustomEvent('gameStateChanged', {
      detail: {delta}
    }))

    if (this.cursorKeys.left.isDown) {
      this.cameraTarget.x -= (delta / 1000) * 500
    }
    if (this.cursorKeys.right.isDown) {
      this.cameraTarget.x += (delta / 1000) * 500
    }
    if (this.cursorKeys.up.isDown) {
      this.cameraTarget.y -= (delta / 1000) * 500
    }
    if (this.cursorKeys.down.isDown) {
      this.cameraTarget.y += (delta / 1000) * 500
    }

    this.controllers.forEach((controller) => {
      controller.update(time, delta)
    })
    this.backgrounds[0].setDisplaySize(this.cameras.main.displayWidth, this.cameras.main.displayHeight)

    this.backgrounds[0].tilePositionX = this.cameraTarget.x / 50
    this.backgrounds[0].tilePositionY = this.cameraTarget.y / 50
  }
}

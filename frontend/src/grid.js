import { extendHex, defineGrid } from 'honeycomb-grid'
import { SVG } from '@svgdotjs/svg.js'

const HEX_SIZE = 40
const FONT_SIZE = 24
const FONT_LEADING = 1.4
const FONT_FILL = '#69c'
const STROKE_WIDTH = 2
const STROKE_COLOR = '#999'

const initGrid = function(width, height, element, getText, isHexVisible) {

    const draw = SVG().addTo(element).size(320, 320)

    console.log('element', element)
    console.log('draw', draw)

    const Hex = extendHex({
        size: HEX_SIZE,
        render(draw) {
            const border = isHexVisible(this.x, this.y)
            const text = getText(this.x, this.y)
            const position = this.toPoint()

            if (border) {
                draw
                    .polygon(this.corners().map(({x, y}) => `${x},${y}`))
                    .fill({ opacity: 0, color: 'none' })
                    .stroke({
                        width: STROKE_WIDTH,
                        color: STROKE_COLOR
                    })
                    .translate(position.x, position.y)
            }

            if (text) {
                const centerPosition = this.center().add(position)
                draw
                    .text(text)
                    .font({
                        size: FONT_SIZE,
                        anchor: 'middle',
                        leading: FONT_LEADING,
                        fill: FONT_FILL
                    })
                    .translate(centerPosition.x, centerPosition.y + FONT_SIZE / 2)
            }
        },
    })

    const Grid = defineGrid(Hex)
    const grid = Grid.rectangle({
        width: width,      // value:	number (width in hexes)
        height: height,    // value:	number (height in hexes)
        onCreate: hex => {
            hex.render(draw)
        }
    })

    console.log('grid', grid)

    const clickToHex = (event) => {
        const { clientX, clientY } = event
        const { x, y } = Grid.pointToHex([clientX, clientY])
        return { x, y }
    }

    const refresh = () => {
        draw.clear()
        grid.forEach((hex) => {
            hex.render(draw)
        })
    }

    return {
        clickToHex,
        refresh
    }
}

export { initGrid };

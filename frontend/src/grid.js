import { extendHex, defineGrid } from 'honeycomb-grid'
import { SVG } from '@svgdotjs/svg.js'

const HEX_SIZE = 40
const FONT_SIZE = 24
const FONT_LEADING = 1.4
const FONT_FILL = '#69c'
const STROKE_WIDTH = 1
const STROKE_COLOR = '#999'

const initGrid = function(width, height, element, clickIndex, getText, isHexVisible) {

    const Hex = extendHex({
        size: HEX_SIZE,
        render(draw, hive) {
            const position = this.toPoint()
            const centerPosition = this.center().add(position)

            this.draw = draw

            // draw the hex
            if (isHexVisible(this.x, this.y)) {
                this.draw
                    .polygon(this.corners().map(({x, y}) => `${x},${y}`))
                    .fill('none')
                    .stroke({
                        width: STROKE_WIDTH,
                        color: STROKE_COLOR
                    })
                    .translate(position.x, position.y)
            }

            // draw text
            const text = getText(this.x, this.y)
            if (text) {
                this.draw
                    .text(text)
                    .font({
                        size: FONT_SIZE,
                        anchor: 'middle',
                        leading: FONT_LEADING,
                        fill: FONT_FILL
                    })
                    .translate(centerPosition.x, centerPosition.y + FONT_SIZE / 2)
            }
        }
    })

    const Grid = defineGrid(Hex)

    element.addEventListener('click', ({ offsetX, offsetY }) => {
        const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
        clickIndex(hexCoordinates.x, hexCoordinates.y)
    })

    const draw = function(value) {
        element.replaceChildren();
        const draw = SVG().addTo(element).size(300, 300)
        const hive = value

        Grid.rectangle({
            width: width,      // value:	number (width in hexes)
            height: height,     // value:	number (height in hexes)
            start: [0, 0], // value: 	any point
            direction: 0,  // value:	0, 1, 2, 3, 4 or 5
            onCreate: hex => {
                hex.render(draw, hive)
            }
        })
    }

    return {
        draw: draw
    }
}

export { initGrid };

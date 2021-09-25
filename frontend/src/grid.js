// import { extendHex, defineGrid } from 'honeycomb-grid'
// import { SVG } from '@svgdotjs/svg.js'

const size = 40
const fontSize = 20
const cells = [
    [-1, 1, -1],
    [2, 0, 6],
    [3, 4, 5]
]

function toIndex(x, y) {
    return cells[x][y]
}

const initGrid = function(element, clickIndex) {

    console.log('initGrid', element)

    const Hex = Honeycomb.extendHex({
        size: size,
        render(draw, hive) {
            const position = this.toPoint()
            const centerPosition = this.center().add(position)

            this.draw = draw

            if (this.x > 0 || this.y === 1) {
                // draw the hex
                this.draw
                    .polygon(this.corners().map(({x, y}) => `${x},${y}`))
                    .fill('none')
                    .stroke({
                        width: 1,
                        color: '#999'
                    })
                    .translate(position.x, position.y)

                // draw x and y coordinates
                const x = this.x
                const y = this.y
                const index = toIndex(x, y)
                const text = `${hive.charAt(index).toUpperCase()}`
                this.draw
                    .text(text)
                    .font({
                        size: fontSize,
                        anchor: 'middle',
                        leading: 1.4,
                        fill: '#69c'
                    })
                    .translate(centerPosition.x, centerPosition.y - fontSize)
            }
        }
    })

    const Grid = Honeycomb.defineGrid(Hex)

    element.addEventListener('click', ({ offsetX, offsetY }) => {
        const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
        const x = hexCoordinates.x
        const y = hexCoordinates.y
        if (x < 0 || x > 2 || y < 0 | y > 2) {
            return
        }
        const index = toIndex(x, y)
        clickIndex(index)
    })

    const draw = function(value) {
        element.replaceChildren();

        const draw = SVG(element)
        const hive = value

        Grid.rectangle({
            width: 3,      // value:	number (width in hexes)
            height: 3,     // value:	number (height in hexes)
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

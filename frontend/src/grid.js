// import { extendHex, defineGrid } from 'honeycomb-grid'
// import { SVG } from '@svgdotjs/svg.js'

const size = 40
const fontSize = 20
const cells = [
    [-1, 1, -1],
    [2, 0, 6],
    [3, 4, 5]
]

const initGrid = function(element) {

    console.log('initGrid', element)

    var hive;

    const Hex = Honeycomb.extendHex({
        size: size,
        render(draw) {
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
                const text = `${hive.charAt(cells[x][y]).toUpperCase()}`
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
        console.log('hexCoordinates', hexCoordinates)
    })

    const draw = function(value) {

        hive = value;

        element.replaceChildren();

        const svg = SVG(element)

        console.log('draw', hive, element)

        Grid.rectangle({
            width: 3,      // value:	number (width in hexes)
            height: 3,     // value:	number (height in hexes)
            start: [0, 0], // value: 	any point
            direction: 0,  // value:	0, 1, 2, 3, 4 or 5
            onCreate: hex => {
                console.log('hex', hex)
                hex.render(svg)
            }
        })
    }

    return {
        draw: draw
    }
}

export { initGrid };

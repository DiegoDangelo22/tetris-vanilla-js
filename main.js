import "./style.css"

const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")
const $score = document.querySelector("span")
const $section = document.querySelector("section")
const leftContainer = document.querySelector(".left-container")
const rightContainer = document.querySelector(".right-container")
const strong = document.querySelector("strong")

const colors = [
    "#47e342",
    "#eb4034",
    "#424ae3",
    "#f0ebeb",
    "#ed77d9",
    "#ffff6e",
    "#ff933b",
    "#94f1f7"
]
const BLOCK_SIZE = 20
const BOARD_WIDTH = 14
const BOARD_HEIGHT = 30
let score = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

function createBoard (width, height) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => ({ value: 0, color: "#fff" })))
}

const piece = {
    position: { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 },
    value: [
        [1, 1],
        [1, 1]
    ],
    color: colors[Math.floor(Math.random() * colors.length)]
}

const pieces = [
    {
        value: [
            [1, 1],
            [1, 1]
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
    },
    {
        value: [
            [1, 1, 1, 1]
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
    },
    {
        value: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
    },
    {
        value: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
    },
    {
        value: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
    },
    {
        value: [
            [0, 1],
            [0, 1],
            [0, 1]
        ],
        color: colors[Math.floor(Math.random() * colors.length)]
    }
]

let dropCounter = 0
let lastTime = 0

function update (time = 0) {
    const deltaTime = time - lastTime
    lastTime = time

    dropCounter += deltaTime

    if (dropCounter > 120) {
        piece.position.y++
        dropCounter = 0

        if (checkCollision()) {
            piece.position.y--
            solidifyPiece()
            removeRows()
        }
    }

    draw()
    window.requestAnimationFrame(update)
}

function draw () {
    context.fillStyle = "#000"
    context.fillRect(0, 0, canvas.width, canvas.height)
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value.value === 1) {
                context.fillStyle = value.color
                context.fillRect(x, y, 1, 1)
            }
        })
    })

    piece.value.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = piece.color
                context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
            }
        })
    })

    $score.innerText = score
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        piece.position.x--
        if (checkCollision()) {
            piece.position.x++
        }
    }

    if (e.key === "ArrowRight") {
        piece.position.x++
        if (checkCollision()) {
            piece.position.x--
        }
    }
    if (e.key === "ArrowDown") {
        piece.position.y++
        if (checkCollision()) {
            piece.position.y--
            solidifyPiece()
            removeRows()
        }
    }
    if (e.key === "ArrowUp") {
        const rotated = []

        for (let i = 0; i < piece.value[0].length; i++) {
            const row = []

            for (let j = piece.value.length - 1; j >= 0; j--) {
                row.push(piece.value[j][i])
            }

            rotated.push(row)
        }

        const previousShape = piece.value
        piece.value = rotated
        if (checkCollision()) {
            piece.value = previousShape
        }
    }
})

function checkCollision () {
    return piece.value.some((row, y) =>
        row.some((value, x) =>
            (value !== 0 && (board[y + piece.position.y]?.[x + piece.position.x]?.value !== 0 ||
                            x + piece.position.x < 0 ||
                            x + piece.position.x >= BOARD_WIDTH ||
                            y + piece.position.y >= BOARD_HEIGHT))
        )
    )
}

function solidifyPiece () {
    piece.value.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1 && board[y + piece.position.y] && board[y + piece.position.y][x + piece.position.x]) {
                board[y + piece.position.y][x + piece.position.x].value = 1
                board[y + piece.position.y][x + piece.position.x].color = piece.color
            }
        })
    })

    const newPiece = pieces[Math.floor(Math.random() * pieces.length)]
    piece.value = newPiece.value
    piece.color = newPiece.color

    piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2)
    piece.position.y = 0

    // Game over
    if (checkCollision()) {
        board.forEach((row) => {
            row.forEach((value) => {
                value.value = 0
                value.color = "#fff"
            })
        })
        window.alert("Game over!")
        score = 0
    }
}

function removeRows () {
    const rowsToRemove = []

    board.forEach((row, y) => {
        if (row.every(cell => cell.value === 1)) {
            rowsToRemove.push(y)
        }
    })

    rowsToRemove.forEach((y) => {
        board.splice(y, 1)
        board.unshift(Array.from({ length: BOARD_WIDTH }, () => ({ value: 0, color: "#fff" })))
        score += 10
    })
}

$section.addEventListener("click", () => {
    update()
    $section.remove()
    leftContainer.style.display = "flex"
    rightContainer.style.display = "flex"
    strong.style.display = "inline-block"
    const audio = new Audio("./Tetris.mp3")
    audio.volume = 0.2
    audio.play()
})

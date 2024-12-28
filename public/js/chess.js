const socket = io();
const chess = new Chess();
const handleBoard = document.querySelector(".chessBoard")

let sourceSquare = null;
let draggedPiece = null;
let playerRole = null;

const handleUniCode = (piece) =>{
    const uniCode = {
        k: '♚',
        q: '♛',
        r: '♜',
        b: '♝',
        n: '♞',
        p: '♙',
        K: '♚',
        Q: '♛',
        R: '♜',
        B: '♝',
        N: '♞',
        P: '♙',
    }

    return uniCode[piece.type] || ''
}
const handleMove = (source, target) =>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q' 
    }

    socket.emit('move', move)
}


const renderBoard = () =>{
    const board = chess.board()
    handleBoard.innerHTML = ''

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex)=>{
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", 
                (rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark'
            )

            squareElement.dataset.row = rowIndex
            squareElement.dataset.col = squareIndex

            if (square) {
                const pieceElement = document.createElement('div')
                pieceElement.classList.add('piece',
                    square.color === 'w' ? 'white' : 'black'
                )
                pieceElement.innerText = handleUniCode(square)
                pieceElement.draggable = playerRole === square.color

                 pieceElement.addEventListener('dragstart', (e)=>{
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowIndex, col: squareIndex}
                        e.dataTransfer.setData('text/plain', '')
                    }
                 })

                 pieceElement.addEventListener('dragend', ()=>{
                        draggedPiece = null;
                        sourceSquare = null;
                 })

                 squareElement.appendChild(pieceElement)
            }

            squareElement.addEventListener('dragover', (e)=>{
                e.preventDefault()
            })

            squareElement.addEventListener('drop', (e)=>{
                e.preventDefault()
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }

                    handleMove(sourceSquare, targetSource)
                }
            })
            handleBoard.appendChild(squareElement)
            

        })
    });

    const isBlackPlayer = playerRole === 'b'
    isBlackPlayer ? handleBoard.classList.add('flipped') : ''

}

renderBoard()

socket.on('playerRole', (role)=>{
    playerRole = role;
    renderBoard()
})

socket.on('spectatorRole', ()=>{
    playerRole = null;
    renderBoard()
})

socket.on('boardState', (fen)=>{
    chess.load(fen)
    renderBoard()
})

socket.on('move', (move)=>{
    chess.move(move)
    renderBoard()
})
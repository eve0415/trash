import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { Message, MessageAttachment, MessageReaction, TextChannel, User } from 'discord.js';
import instance from '..';
import { Command, keyToValue } from '../../index';

const processer = async (message: Message): Promise<void | Message> => {
    if (message.mentions.users.size > 1) return message.channel.send('You can only play with two players including you');

    const mention = message.mentions.users.first();

    if (message.mentions.users.size === 1 && mention !== instance.getClient().user) {
        if (mention?.bot) return message.channel.send('How can you play with bot!');
        if (mention === message.author) return message.channel.send('Why did you mention yourself?');

        const mes = await message.channel.send(`${mention}, ${message.author} want to play \`othello\` with you!\nReact to \`accept\` or \`decline\``);
        await mes.react('✅');
        await mes.react('❌');

        const filter = (reaction: MessageReaction, user: User) => user === mention && ['✅', '❌'].includes(reaction.emoji.name);
        mes.awaitReactions(filter, { time: 10000, max: 1, errors: ['time'] })
            .then(collected => {
                if (collected.first()?.emoji.name === '✅') {
                    startGame(message, mention);
                } else {
                    message.channel.send(`${message.author}, ${mention} decline the invitation. Better luck next time.`);
                }
            })
            .catch(() => {
                message.channel.send(`${message.author}, ${mention} did not react in time`);
            })
            .finally(() => mes.delete());
    } else {
        startGame(message);
    }
};

const startGame = async (message: Message, player: User | 'cpu' = 'cpu') => {
    const mes = await message.channel.send('Preparing...    Please wait');
    new othello(mes, message.author, player);
};

class othello {
    ready = false;
    skipped = 0;
    state: state;
    lastState!: state;
    grid: grid;
    board: cell[][];
    message: Message;
    boardMessage!: Message;
    rowMessage!: Message;
    columnMessage!: Message;
    players: { white: User | 'cpu'; black: User | 'cpu'; };
    row!: string | null;
    column!: string | null;
    placeableCells!: cell[];

    constructor(message: Message, player1: User, player2: User | 'cpu') {
        this.state = 'preparing';
        const g = this.grid = new grid;
        this.board = [
            [g.A1, g.A2, g.A3, g.A4, g.A5, g.A6, g.A7, g.A8],
            [g.B1, g.B2, g.B3, g.B4, g.B5, g.B6, g.B7, g.B8],
            [g.C1, g.C2, g.C3, g.C4, g.C5, g.C6, g.C7, g.C8],
            [g.D1, g.D2, g.D3, g.D4, g.D5, g.D6, g.D7, g.D8],
            [g.E1, g.E2, g.E3, g.E4, g.E5, g.E6, g.E7, g.E8],
            [g.F1, g.F2, g.F3, g.F4, g.F5, g.F6, g.F7, g.F8],
            [g.G1, g.G2, g.G3, g.G4, g.G5, g.G6, g.G7, g.G8],
            [g.H1, g.H2, g.H3, g.H4, g.H5, g.H6, g.H7, g.H8],
        ];

        this.message = message;

        const role = Math.floor(Math.random() * (1 + 1 - 0)) + 0;
        const white = role === 0 ? player1 : player2;

        this.players = { white: white, black: white === player1 ? player2 : player1 };

        this.init();
    }

    private async init() {
        this.grid.D4.stone = this.grid.E5.stone = 'white';
        this.grid.D5.stone = this.grid.E4.stone = 'black';

        this.boardMessage = await this.message.channel.send({ embed: { color: 1, image: { url: 'https://i.imgur.com/KFvDoSa.png' } } });
        this.rowMessage = await this.message.channel.send('```ROW```');
        this.columnMessage = await this.message.channel.send('```COLUMN```');

        for (const r of rowReactions) {
            await this.rowMessage.react(r);
        }
        for (const r of columnReactions) {
            await this.columnMessage.react(r);
        }

        const rowCollector = this.rowMessage.createReactionCollector(filter);
        const columnCollector = this.columnMessage.createReactionCollector(filter);

        rowCollector.on('collect', (reaction, user) => this.handleReaction(this.rowMessage, reaction, user));
        columnCollector.on('collect', (reaction, user) => this.handleReaction(this.columnMessage, reaction, user));

        await this.getPlacableCells('black');
        await this.message.edit(`We are now ready. Let's start!\n${this.players.black}, choose where you want to put a stone by reacting!`);

        this.sendMessageAndDelete(`${this.players.black}, Your role is black!\n${this.players.white}, Your role is white!`);

        this.ready = true;
        this.state = this.lastState = 'black';

        if (this.players.black === 'cpu') this.cpuTurn();
    }

    private handleReaction(message: Message, reaction: MessageReaction, user: User) {
        if (!(message === this.rowMessage && rowReactions.includes(reaction.emoji.name) || message === this.columnMessage && columnReactions.includes(reaction.emoji.name))) {
            this.sendMessageAndDelete(`${user}, Invalid reaction`);
            return reaction.users.remove(user);
        }
        if (!(this.state === 'white' || this.state === 'black')) {
            this.sendMessageAndDelete(`${user}, please do not react right now. Still preparing...`);
            return reaction.users.remove(user);
        }
        if (!(this.state === 'black' && this.players.black === user || this.state === 'white' && this.players.white === user)) {
            this.sendMessageAndDelete(`${user}, it's not your turn`);
            return reaction.users.remove(user);
        }

        if (message === this.rowMessage) {
            if (this.row) this.rowMessage.reactions.cache.get(this.row)?.users.remove(user);
            this.row = reaction.emoji.name;
        }
        if (message === this.columnMessage) {
            if (this.column) this.columnMessage.reactions.cache.get(this.column)?.users.remove(user);
            this.column = reaction.emoji.name;
        }

        if (this.row && this.column) {
            const rowReaction = reactionsToString[this.row];
            const columnReaction = reactionsToString[this.column];

            this.rowMessage.reactions.cache.get(this.row)?.users.remove(user);
            this.columnMessage.reactions.cache.get(this.column)?.users.remove(user);
            this.row = this.column = null;

            if (this.placeableCells.includes(this.grid[`${rowReaction.valueOf()}${columnReaction.valueOf()}`])) {
                this.lastState = this.state;
                this.state = 'processing';

                this.placeStone(this.grid[`${rowReaction}${columnReaction}`]);
                this.changeTurn();
            } else {
                this.sendMessageAndDelete(`${user}, You cannot put a stone at \`${rowReaction}${columnReaction}\`\nPlease choose another.`);
            }
        }
    }

    private async changeTurn(edit = true) {
        const nextState = this.lastState === 'black' ? 'white' : 'black';
        const nextColor = nextState === 'black' ? 'black' : 'white';
        const nextPlayer = nextState === 'black' ? this.players.black : this.players.white;

        await this.editBoard(edit);

        if (this.isBoardFull()) return this.gameFinish();

        await this.getPlacableCells(nextColor);

        this.lastState = this.state;
        this.state = nextState;

        if (this.placeableCells.length === 0) {
            return this.skipTurn();
        }

        this.skipped = 0;

        if (nextPlayer === 'cpu') {
            await this.message.edit(`${instance.getClient().user} is thinking...`);
            return this.cpuTurn();
        } else {
            await this.message.edit(`${nextPlayer}, choose where you want to put a stone by reacting!`);
        }
        this.sendMessageAndDelete(`${nextPlayer}, it's your turn`);
    }

    private cpuTurn() {
        setTimeout(() => {
            const random = Math.floor(Math.random() * (this.placeableCells.length - 1 - 0 + 1)) + 0;
            const cell = this.placeableCells[random];
            this.lastState = this.state;
            this.state = 'processing';
            this.placeStone(cell);
            this.changeTurn();
        }, 7000);
    }

    private skipTurn() {
        this.skipped++;
        if (this.skipped === 2) this.gameFinish();
        const player = this.state === 'black' ? this.players.black : this.players.white;
        if (player !== 'cpu') this.sendMessageAndDelete(`${player}, sorry! There aren't any space that you can put! Skipping...`);
        this.lastState = this.state;
        this.state = 'processing';
        this.changeTurn(false);
    }

    private isBoardFull() {
        const openCell: cell[] = [];
        this.board.forEach(row => row.forEach(cell => {
            if (cell.stone === 'none') openCell.push(cell);
        }));
        return openCell.length === 0;
    }

    private placeStone(cell: cell) {
        this.board.forEach((rows, y) => {
            rows.forEach((c, x) => {
                if (c === cell) place(this.board, x, y, this.lastState === 'black' ? 'black' : 'white');
            });
        });
    }

    private async getPlacableCells(type: stone) {
        this.placeableCells = await getPlacableCells(this.board, type);
    }

    private async editBoard(refresh: boolean) {
        let url = this.boardMessage.embeds[0].image?.url;
        if (refresh) {
            const canvas = new Canvas(600, 600);
            const context = createBoard(canvas);
            drawStone(context, this.board);

            const attachment = new MessageAttachment(canvas.toBuffer());
            const channelID = process.env.CACHE_CHANNEL ?? '';
            const cacheChannel: TextChannel = instance.getClient().channels.cache.get(channelID) as TextChannel;
            if (!cacheChannel) return this.error();
            const pictureMessage = await cacheChannel.send(attachment);
            url = pictureMessage.attachments.first()?.url;
        }
        await this.boardMessage.edit({ embed: { color: this.lastState === 'black' ? 16777214 : 1, image: { url: url } } });
    }

    private sendMessageAndDelete(content: string) {
        this.message.channel.send(content).then(mes => mes.delete({ timeout: 3000 }));
    }

    private error() {
        this.message.delete();
        this.rowMessage.delete();
        this.columnMessage.delete();
        this.boardMessage.edit({ embed: { color: 15158332, description: 'Sorry, there was an error with sending picture.\nPlease try again later.' } });
    }

    private gameFinish() {
        this.message.edit('Calculating stones');
        this.rowMessage.delete();
        this.columnMessage.delete();
        const whiteCell: cell[] = [], blackCell: cell[] = [];
        this.board.forEach(row => row.forEach(cell => {
            if (cell.stone === 'black') blackCell.push(cell);
            if (cell.stone === 'white') whiteCell.push(cell);
        }));

        const winColor = whiteCell.length === blackCell.length
            ? 'draw'
            : whiteCell.length < blackCell.length
                ? 'blackWin'
                : 'whiteWin';
        const winPlayer = winColor === 'draw'
            ? `Both player, ${this.players.black} & ${this.players.white}`
            : winColor === 'blackWin'
                ? this.players.black
                : this.players.white;
        const embedColor = winColor === 'draw'
            ? 12370112
            : winColor === 'blackWin'
                ? 1
                : 16777214;

        this.boardMessage.edit({ embed: { color: embedColor, image: { url: this.boardMessage.embeds[0].image?.url } } });
        this.message.edit(`${winPlayer} WIN!!!\nBlack: ${blackCell.length}    White: ${whiteCell.length}`);
        this.sendMessageAndDelete(`${winPlayer} WIN!!!`);
    }
}

class cell {
    name: string;
    stone: stone;
    readonly x: number;
    readonly y: number;
    constructor(name: string, x: number, y: number) {
        this.name = name;
        this.stone = 'none';
        this.x = x;
        this.y = y;
    }
}

class grid {
    A1 = new cell('A1', 96, 96);
    A2 = new cell('A2', 96, 160);
    A3 = new cell('A3', 96, 224);
    A4 = new cell('A4', 96, 288);
    A5 = new cell('A5', 96, 352);
    A6 = new cell('A6', 96, 416);
    A7 = new cell('A7', 96, 480);
    A8 = new cell('A8', 96, 544);

    B1 = new cell('B1', 160, 96);
    B2 = new cell('B2', 160, 160);
    B3 = new cell('B3', 160, 224);
    B4 = new cell('B4', 160, 288);
    B5 = new cell('B5', 160, 352);
    B6 = new cell('B6', 160, 416);
    B7 = new cell('B7', 160, 480);
    B8 = new cell('B8', 160, 544);

    C1 = new cell('C1', 224, 96);
    C2 = new cell('C2', 224, 160);
    C3 = new cell('C3', 224, 224);
    C4 = new cell('C4', 224, 288);
    C5 = new cell('C5', 224, 352);
    C6 = new cell('C6', 224, 416);
    C7 = new cell('C7', 224, 480);
    C8 = new cell('C8', 224, 544);

    D1 = new cell('D1', 288, 96);
    D2 = new cell('D2', 288, 160);
    D3 = new cell('D3', 288, 224);
    D4 = new cell('D4', 288, 288);
    D5 = new cell('D5', 288, 352);
    D6 = new cell('D6', 288, 416);
    D7 = new cell('D7', 288, 480);
    D8 = new cell('D8', 288, 544);

    E1 = new cell('E1', 352, 96);
    E2 = new cell('E2', 352, 160);
    E3 = new cell('E3', 352, 224);
    E4 = new cell('E4', 352, 288);
    E5 = new cell('E5', 352, 352);
    E6 = new cell('E6', 352, 416);
    E7 = new cell('E7', 352, 480);
    E8 = new cell('E8', 352, 544);

    F1 = new cell('F1', 416, 96);
    F2 = new cell('F2', 416, 160);
    F3 = new cell('F3', 416, 224);
    F4 = new cell('F4', 416, 288);
    F5 = new cell('F5', 416, 352);
    F6 = new cell('F6', 416, 416);
    F7 = new cell('F7', 416, 480);
    F8 = new cell('F8', 416, 544);

    G1 = new cell('G1', 480, 96);
    G2 = new cell('G2', 480, 160);
    G3 = new cell('G3', 480, 224);
    G4 = new cell('G4', 480, 288);
    G5 = new cell('G5', 480, 352);
    G6 = new cell('G6', 480, 416);
    G7 = new cell('G7', 480, 480);
    G8 = new cell('G8', 480, 544);

    H1 = new cell('H1', 544, 96);
    H2 = new cell('H2', 544, 160);
    H3 = new cell('H3', 544, 224);
    H4 = new cell('H4', 544, 288);
    H5 = new cell('H5', 544, 352);
    H6 = new cell('H6', 544, 416);
    H7 = new cell('H7', 544, 480);
    H8 = new cell('H8', 544, 544);
}

const createBoard = (canvas: Canvas) => {
    const context = canvas.getContext('2d');
    context.font = '55px Times New Roman';
    context.fillText('A  B  C  D  E  F  G  H', 75, 60);
    for (let i = 1; i <= 8; i++) {
        context.fillText(i.toString(), 30, 115 + (i - 1) * 64);
    }
    for (let y = 1; y < 9; y++) {
        for (let x = 1; x < 9; x++) {
            drawGrid(context, x, y);
        }
    }
    return context;
};

const drawGrid = (context: CanvasRenderingContext2D, x: number, y: number) => {
    const cellSize = 64;
    context.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
    context.fillStyle = 'rgba(0, 128, 0, 1.0)';
    context.strokeStyle = 'black';
    context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
};

const drawStone = (context: CanvasRenderingContext2D, board: cell[][]) => {
    board.forEach(b => b.forEach(g => {
        if (g.stone === 'none') return;
        context.beginPath();
        context.arc(g.x, g.y, 28, 0, 2 * Math.PI, false);
        context.fillStyle = g.stone === 'black' ? 'black' : 'white';
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = 'black';
        context.stroke();
    }));
};

const getPlacableCells = (board: cell[][], type: stone) => {
    const placeableCells: cell[] = [];
    board.forEach((rows, y) => {
        rows.forEach((c, x) => {
            if (c.stone !== 'none') return;
            if (canPlace(board, x, y, type)) placeableCells.push(c);
        });
    });
    return Promise.resolve(placeableCells);
};

const canPlace = (board: cell[][], x: number, y: number, type: stone) => getDiffCells(board, place(JSON.parse(JSON.stringify(board)), x, y, type)) > 1;

const getDiffCells = (boardA: cell[][], boardB: cell[][]) => {
    const diff: cell[] = [];
    boardA.forEach((rows, y) => {
        rows.forEach((c, x) => {
            if (c.stone !== boardB[y][x].stone) diff.push(boardB[y][x]);
        });
    });
    return diff.length;
};

const place = (board: cell[][], x: number, y: number, type: stone): cell[][] => {
    const placed = board[y][x].stone = type;

    // Left direction
    for (let i = x - 1; i >= 0; i--) {
        if (board[y][i].stone === 'none') break;
        if (board[y][i].stone === placed) {
            for (let k = i + 1; k < x; k++) {
                board[y][k].stone = placed;
            }
            break;
        }
    }

    // Right direction
    for (let i = x + 1; i < 8; i++) {
        if (board[y][i].stone === 'none') break;
        if (board[y][i].stone === placed) {
            for (let k = i - 1; k > x; k--) {
                board[y][k].stone = placed;
            }
            break;
        }
    }

    // Top direction
    for (let i = y - 1; i >= 0; i--) {
        if (board[i][x].stone === 'none') break;
        if (board[i][x].stone === placed) {
            for (let k = i + 1; k < y; k++) {
                board[k][x].stone = placed;
            }
        }
    }

    // Bottom direction
    for (let i = y + 1; i < 8; i++) {
        if (board[i][x].stone === 'none') break;
        if (board[i][x].stone === placed) {
            for (let k = i - 1; k > y; k--) {
                board[k][x].stone = placed;
            }
            break;
        }
    }

    // Right bottom direction
    if (x <= y) {
        for (let i = y + 1; i < 8; i++) {
            if (board[i][i - (y - x)].stone === 'none') break;
            if (board[i][i - (y - x)].stone === placed) {
                for (let k = i - 1; k > y; k--) {
                    board[k][k - (y - x)].stone = placed;
                }
                break;
            }
        }
    } else {
        for (let i = x + 1; i < 8; i++) {
            if (board[i - (x - y)][i].stone === 'none') break;
            if (board[i - (x - y)][i].stone === placed) {
                for (let k = i - 1; k > x; k--) {
                    board[k - (x - y)][k].stone = placed;
                }
                break;
            }
        }
    }

    // Right top direction
    if (y < 8 - 1 - x) {
        for (let i = y - 1; i >= 0; i--) {
            if (board[i][x + (y - i)].stone === 'none') break;
            if (board[i][x + (y - i)].stone === placed) {
                for (let k = i + 1; k < y; k++) {
                    board[k][x + (y - k)].stone = placed;
                }
                break;
            }
        }
    } else {
        for (let i = x + 1; i < 8; i++) {
            if (board[y - (i - x)][i].stone === 'none') break;
            if (board[y - (i - x)][i].stone === placed) {
                for (let k = i - 1; k > x; k--) {
                    board[y - (k - x)][k].stone = placed;
                }
                break;
            }
        }
    }

    // Left top direction
    if (y < x) {
        for (let i = y - 1; i >= 0; i--) {
            if (board[i][x - (y - i)].stone === 'none') break;
            if (board[i][x - (y - i)].stone === placed) {
                for (let k = i + 1; k < y; k++) {
                    board[k][x - (y - k)].stone = placed;
                }
                break;
            }
        }
    } else {
        for (let i = x - 1; i >= 0; i--) {
            if (board[y - (x - i)][i].stone === 'none') break;
            if (board[y - (x - i)][i].stone === placed) {
                for (let k = i + 1; k < x; k++) {
                    board[y - (x - k)][k].stone = placed;
                }
                break;
            }
        }
    }

    // Left bottom direction
    if (x < 8 - 1 - y) {
        for (let i = x - 1; i >= 0; i--) {
            if (board[y + (x - i)][i].stone === 'none') break;
            if (board[y + (x - i)][i].stone === placed) {
                for (let k = i + 1; k < x; k++) {
                    board[y + (x - k)][k].stone = placed;
                }
                break;
            }
        }
    } else {
        for (let i = y + 1; i < 8; i++) {
            if (board[i][x - (i - y)].stone === 'none') break;
            if (board[i][x - (i - y)].stone === placed) {
                for (let k = i - 1; k > y; k--) {
                    board[k][x - (k - y)].stone = placed;
                }
                break;
            }
        }
    }
    return board;
};

const filter = (_reaction: MessageReaction, user: User) => user !== instance.getClient().user;

const rowReactions = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'];
const columnReactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

type state = 'preparing'| 'processing'| 'white'|'black'| 'whiteWin'| 'blackWin'| 'draw';

type stone = 'none' | 'white' | 'black';

const reactionsToString: keyToValue = {
    '1️⃣': '1',
    '2️⃣': '2',
    '3️⃣': '3',
    '4️⃣': '4',
    '5️⃣': '5',
    '6️⃣': '6',
    '7️⃣': '7',
    '8️⃣': '8',
    '🇦': 'A',
    '🇧': 'B',
    '🇨': 'C',
    '🇩': 'D',
    '🇪': 'E',
    '🇫': 'F',
    '🇬': 'G',
    '🇭': 'H',
};

const othelloCom: Command = {
    name: 'othello',
    run: processer,
};

export default othelloCom;

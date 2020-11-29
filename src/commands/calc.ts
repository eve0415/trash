import { Message, MessageReaction, User } from 'discord.js';
import instance from '..';
import { keyToValue, Command } from '../../index';

const processer = async (message: Message): Promise<void | Message> => {
    const mes0 = await message.channel.send('```初期化中....    （電卓を開いて計算した方が早いよ）      \n```');
    const mes1 = await message.channel.send('```\n```');
    const mes2 = await message.channel.send('```\n```');
    const mes3 = await message.channel.send('```\n```');

    await Promise.all([mes0.react('7️⃣'), mes1.react('4️⃣'), mes2.react('1️⃣'), mes3.react('0️⃣')]);
    await Promise.all([mes0.react('8️⃣'), mes1.react('5️⃣'), mes2.react('2️⃣'), mes3.react('➕')]);
    await Promise.all([mes0.react('9️⃣'), mes1.react('6️⃣'), mes2.react('3️⃣'), mes3.react('➖')]);
    await Promise.all([mes0.react('◀️'), mes1.react('➗'), mes2.react('✖️')]);

    new Calculator(mes0, mes1, mes2, mes3);
};

const defaultReactions = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '➕', '➖', '✖️', '➗', '◀️'];

const reactionsToString: keyToValue = {
    '0️⃣': '0',
    '1️⃣': '1',
    '2️⃣': '2',
    '3️⃣': '3',
    '4️⃣': '4',
    '5️⃣': '5',
    '6️⃣': '6',
    '7️⃣': '7',
    '8️⃣': '8',
    '9️⃣': '9',
    '➕': '+',
    '➖': '-',
    '✖️': '×',
    '➗': '÷',
    '◀️': '<',
};

const filter = (reaction: MessageReaction, user: User) => user !== instance.getClient().user;

class Calculator {
    private readonly message: Message;
    private formula: string;
    constructor(message: Message, mes1: Message, mes2: Message, mes3: Message) {
        this.message = message;
        this.formula = '';

        this.startCollecting(message);
        this.startCollecting(mes1);
        this.startCollecting(mes2);
        this.startCollecting(mes3);

        message.edit('```0\n```');
    }

    startCollecting(message: Message) {
        const collector = message.createReactionCollector(filter);
        collector.on('collect', (reaction, user) => this.handleReaction(reaction, user));
    }

    handleReaction(reaction: MessageReaction, user: User) {
        if (!defaultReactions.includes(reaction.emoji.name)) return reaction.users.remove(user);
        if (this.formula === '' && (isNaN(Number(reactionsToString[reaction.emoji.name])) || reaction.emoji.name === '0️⃣')) return reaction.users.remove(user);
        const lastString = this.formula.slice(-1);
        if (reactionsToString[reaction.emoji.name] === '<') {
            this.formula = this.formula.substring(0, this.formula.length - 1);
            if (this.formula.slice(-1) === ' ') this.formula = this.formula.substring(0, this.formula.length - 1);
        } else {
            if (isNaN(Number(lastString)) && isNaN(Number(reactionsToString[reaction.emoji.name]))) return reaction.users.remove(user);
            if (isNaN(Number(lastString)) && !isNaN(Number(reactionsToString[reaction.emoji.name]))) this.formula += ' ';
            if (isNaN(Number(reactionsToString[reaction.emoji.name]))) this.formula += ' ';
            this.formula += reactionsToString[reaction.emoji.name];
        }
        try {
            const result: string|undefined = eval(this.formula.replace(/×/g, '*').replace(/÷/g, '/')) as string;
            if (result === this.formula || result === undefined) {
                this.message.edit(`\`\`\`${this.formula === '' ? 0 : this.formula}\n\`\`\``);
            } else {
                this.message.edit(`\`\`\`${this.formula} = ${result}\n\`\`\``);
            }
        } catch {
            this.message.edit(`\`\`\`${this.formula}\n\`\`\``);
        } finally {
            reaction.users.remove(user);
        }
    }
}

const calc: Command = {
    name: 'calc',
    run: processer,
};

export default calc;

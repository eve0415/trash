import { Message } from 'discord.js';

interface runFunction {
    (message: Message, args: Array<string>): Promise<void>;
}

export default interface Command {
    name: string;
    run: runFunction;
};

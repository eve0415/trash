import { Message } from 'discord.js';

type runFunction = (message: Message, args: string[]) => Promise<void | Message>;

type keyToValue = {
    [key: string]: string;
};

type Command = {
    name: string;
    run: runFunction;
};

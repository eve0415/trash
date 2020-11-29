import { Client, Collection } from 'discord.js';
import allCommands from './commands';
import { Command } from '../index';

const commands = new Collection<string, Command>();
allCommands.forEach(c => commands.set(c.name, c));

export default class instance {
    private static client: Client;
    private static readonly prefix = '!';

    constructor() {
        instance.client = new Client();
        this.init();
    }

    public static getClient(): Client {
        return this.client;
    }

    public static getPrefix(): string {
        return this.prefix;
    }

    init(): void {
        initEvent(instance.client);
    }
}

const initEvent = (client: Client) => {
    client.on('ready', () => console.log('ready'));

    client.on('message', message => {
        if (message.author.bot) return;
        const [command, ...args] = message.content.toLowerCase().slice(instance.getPrefix().length).split(' ');

        const cmd = commands.get(command);
        if (!cmd) return;

        cmd.run(message, args);
    });

    client.login().catch(console.error);
};

new instance();

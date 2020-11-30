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

    client.on('voiceStateUpdate', (oldState, newState) => {
        if (!oldState.channel && newState.channel) {
            console.log('join');
            client.emit('voiceChannelJoin', newState);
        } else if (oldState.channel && !newState.channel) {
            console.log('leave');
            client.emit('voiceChannelLeave', newState);
        } else if (!oldState.selfDeaf && newState.selfDeaf) {
            console.log('deaf');
            client.emit('voiceDeaf', newState);
        } else if (oldState.selfDeaf && !newState.selfDeaf) {
            console.log('undeaf');
            client.emit('voiceUndeaf', newState);
        } else if (!oldState.selfMute && newState.selfMute) {
            console.log('mute');
            client.emit('voiceMute', newState);
        } else if (oldState.selfMute && !newState.selfMute) {
            console.log('unmute');
            client.emit('voiceUnmute', newState);
        } else if (!oldState.serverDeaf && newState.serverDeaf) {
            console.log('deaf by server');
            client.emit('voiceServerwideDeaf', newState);
        } else if (oldState.serverDeaf && !newState.serverDeaf) {
            console.log('deaf by server');
            client.emit('voiceServerwideUndeaf', newState);
        } else if (!oldState.serverMute && newState.serverMute) {
            console.log('mute by server');
            client.emit('voiceServerwideMute', newState);
        } else if (oldState.serverMute && !newState.serverMute) {
            console.log('unmute by server');
            client.emit('voiceServerwideUnmute', newState);
        } else if (!oldState.selfVideo && newState.selfVideo) {
            console.log('start video');
            client.emit('voiceVideoStart', newState);
        } else if (oldState.selfVideo && !newState.selfVideo) {
            console.log('stop video');
            client.emit('voiceVideoStop', newState);
        } else if (!oldState.streaming && newState.streaming) {
            console.log('stream start');
            client.emit('voiceStreamStart', newState);
        } else if (oldState.streaming && !newState.streaming) {
            console.log('stream stop');
            client.emit('voiceStreamStop', newState);
        } else if (oldState.channel && newState.channel) {
            console.log('change');
            client.emit('voiceChannelChange', oldState, newState);
        }
    });

    client.login().catch(console.error);
};

new instance();

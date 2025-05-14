import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Message,
  PermissionResolvable,
  SharedSlashCommand,
} from "discord.js";
import type { DisTube, DisTubeEvents } from "distube";

export interface SlashCommand {
  command: SharedSlashCommand;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => void;
  cooldown?: number; // in seconds
}

export interface Command {
  name: string;
  execute: (message: Message, args: Array<string>) => void;
  permissions: Array<PermissionResolvable>;
  aliases: Array<string>;
  cooldown?: number;
}

export interface Subcommand {
  name: string;
  execute: (interaction: ChatInputCommandInteraction) => void;
}

export interface Task {
  name: string;
  execute: (client: Client) => void;
  cronTime: string;
}

interface GuildOptions {
  prefix: string;
}

export type GuildOption = keyof GuildOptions;
export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

export interface DistubeEvent {
  name: keyof DisTubeEvents;
  execute: (...args) => void;
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
    tasks: Collection<string, Task>;
    distube: DisTube;
  }
}

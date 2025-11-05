import type {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Message,
  ModalSubmitInteraction,
  PermissionResolvable,
  SharedSlashCommand,
} from "discord.js";
import type { Melodi } from "./melodi";

export interface SlashCommand {
  command: SharedSlashCommand;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => Promise<void>;
  cooldown?: number; // in seconds
}

export interface Command {
  name: string;
  execute: (message: Message, args: Array<string>) => Promise<void>;
  permissions: Array<PermissionResolvable>;
  aliases: Array<string>;
  cooldown?: number;
}

export interface Subcommand {
  name: string;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
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
  once?: boolean;
  execute: (...args) => Promise<void>;
}

export interface MelodiEvent {
  name: string;
  execute: (client: Client, ...args) => Promise<void>;
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
    tasks: Collection<string, Task>;
    melodi: Melodi;
  }
}

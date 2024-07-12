import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand, Subcommand } from "@/types";

type MCServerSubcommand = "status" | "start" | "stop";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("minecraft-server")
    .setDescription("Commands to manage the Minecraft server")
    .addSubcommand((subcommand) =>
      subcommand.setName("status").setDescription("Show the status of the server")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("start").setDescription("Start the server")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("stop").setDescription("Stop the server")
    ),
  execute: async (interaction) => {
    const subcommandName = interaction.options.getSubcommand() as MCServerSubcommand;

    const { default: subcommand }: { default: Subcommand } = await import(
      `./subcommands/${subcommandName}`
    );

    subcommand.execute(interaction);
  },
};

export default command;

import type { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { execAsync } from "@/functions/exec-async";
import { useMcServerStatus } from "@/functions/use-mc-server-status";
import type { SlashCommand } from "@/types";

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
  execute(interaction) {
    const subcommand = interaction.options.getSubcommand() as MCServerSubcommand;

    switch (subcommand) {
      case "status":
        status(interaction);
        break;
      case "start":
        start(interaction);
        break;
      case "stop":
        stop(interaction);
        break;
    }
  },
};

async function status(interaction: ChatInputCommandInteraction) {
  const status = await useMcServerStatus();

  if (!status.online) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Minecraft server is offline")
          .setDescription("The Minecraft server is offline.")
          .setColor("#6441A4"),
      ],
      ephemeral: true,
    });
    return;
  }

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: "Server from MasterJMVR",
        })
        .setTitle(":gem: Minecraft server is online")
        .setDescription(status.motd!.clean.join("\n"))
        .addFields({
          name: ":busts_in_silhouette: Players:",
          value: `${status.players!.online}/${status.players!.max}`,
        })
        .setColor("#6441A4"),
    ],
  });
}

async function start(interaction: ChatInputCommandInteraction) {
  const status = await useMcServerStatus();
  if (status.online) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Minecraft server is already online")
          .setColor("#6441A4"),
      ],
      ephemeral: true,
    });
    return;
  }

  const connection = process.env.SSH_CONNECTION;
  const key = process.env.SSH_KEY_PATH;

  const { stdout: _, stderr } = await execAsync(
    `ssh -i ${key} ${connection} 'screen -S server -X ./run.sh'`
  );

  if (stderr) {
    interaction.reply({
      content: stderr,
      ephemeral: true,
    });
    return;
  }

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(":hourglass_flowing_sand: Minecraft server is starting")
        .setColor("#6441A4"),
    ],
    ephemeral: true,
  });
}

async function stop(interaction: ChatInputCommandInteraction) {
  const status = await useMcServerStatus();
  if (!status.online) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Minecraft server is already offline")
          .setColor("#6441A4"),
      ],
    });
    return;
  }

  const connection = process.env.SSH_CONNECTION;
  const key = process.env.SSH_KEY_PATH;

  const { stdout: _, stderr } = await execAsync(
    `ssh -i ${key} ${connection} 'screen -S server -X stuff "stop\n"'`
  );

  if (stderr) {
    interaction.reply({
      content: stderr,
      ephemeral: true,
    });
    return;
  }

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(":hourglass_flowing_sand: Minecraft server is stopping")
        .setColor("#6441A4"),
    ],
    ephemeral: true,
  });
}

export default command;

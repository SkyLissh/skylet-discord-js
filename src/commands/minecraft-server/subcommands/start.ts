import { EmbedBuilder } from "discord.js";

import { execAsync } from "@/functions/exec-async";
import { useMcServerStatus } from "@/functions/use-mc-server-status";
import type { Subcommand } from "@/types";

const subcommand: Subcommand = {
  name: "start",
  execute: async (interaction) => {
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
      `ssh -i ${key} ${connection} 'screen -r server -X "sh run.sh"'`
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
  },
};

export default subcommand;

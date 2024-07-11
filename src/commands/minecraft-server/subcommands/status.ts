import { EmbedBuilder } from "discord.js";

import { useMcServerStatus } from "@/functions/use-mc-server-status";
import type { Subcommand } from "@/types";

const subcommand: Subcommand = {
  name: "status",
  execute: async (interaction) => {
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
  },
};

export default subcommand;

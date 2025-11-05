import type { GuildMember } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { format } from "date-fns";

import { logger } from "~/logger";
import { InvalidUrl, NoResultsFound, PlaylistNotSupported } from "~/melodi/errors";
import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from YouTube")
    .addStringOption((option) =>
      option.setName("song").setDescription("URL or name of the song").setRequired(true)
    ),
  execute: async (interaction) => {
    const query = interaction.options.getString("song", true);

    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;

    if (!channel || !channel.isVoiceBased()) return;

    try {
      const song = await interaction.client.melodi.play(channel, query);

      if (Array.isArray(song)) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#e30026")
              .setDescription(`📝 Added to queue: ${song.length} songs`),
          ],
        });

        return;
      }

      const duration = song.duration || 0;
      const formattedDuration = format(new Date(duration * 1000), "mm:ss");

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#e30026")
            .setDescription(
              `📝 Added to queue: **[${song.author} - ${song.title}](${song.url_canonical})** |  \`${formattedDuration}\``
            ),
        ],
      });
    } catch (error) {
      if (error instanceof InvalidUrl) {
        await interaction.reply({
          content: "Invalid URL",
          flags: "Ephemeral",
        });
      } else if (error instanceof NoResultsFound) {
        await interaction.reply({
          content: "No results found",
          flags: "Ephemeral",
        });
      } else if (error instanceof PlaylistNotSupported) {
        await interaction.reply({
          content: "Playlist not supported",
          flags: "Ephemeral",
        });
      } else {
        logger.error(error);
        await interaction.reply({
          content: "An error occurred while playing the song",
          flags: "Ephemeral",
        });
      }
    }
  },
};

export default command;

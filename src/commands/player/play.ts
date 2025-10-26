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

      const channelId = song.channel_id;
      const channelUrl = channelId
        ? `https://www.youtube.com/channel/${channelId}`
        : undefined;
      const thumbnailUrl = song.thumbnail?.[0]?.url;
      const duration = song.duration || 0;

      const embed = new EmbedBuilder()
        .setColor("#e30026")
        .setAuthor({
          name: song.author || "Unknown",
          url: channelUrl,
        })
        .setTitle(`Playing ${song.title}`)
        .setURL(song.url_canonical)
        .setFooter({ text: `Duration: ${format(new Date(duration * 1000), "mm:ss")}` });

      if (thumbnailUrl) {
        embed.setImage(thumbnailUrl);
      }

      interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      if (error instanceof InvalidUrl) {
        interaction.reply({
          content: "Invalid URL",
          flags: "Ephemeral",
        });
      } else if (error instanceof NoResultsFound) {
        interaction.reply({
          content: "No results found",
          flags: "Ephemeral",
        });
      } else if (error instanceof PlaylistNotSupported) {
        interaction.reply({
          content: "Playlist not supported",
          flags: "Ephemeral",
        });
      } else {
        logger.error(error);
        interaction.reply({
          content: "An error occurred while playing the song",
          flags: "Ephemeral",
        });
      }
    }
  },
};

export default command;

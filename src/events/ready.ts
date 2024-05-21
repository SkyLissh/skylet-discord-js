import type { Client } from "discord.js";
import { Events } from "discord.js";

import { CronJob } from "cron";

import { text, variable } from "@/theme";
import type { BotEvent } from "@/types";

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    console.log(`${text("🌠 Ready!")} ${variable(client.user?.username)}`);

    client.tasks.forEach((task) => {
      CronJob.from({
        cronTime: task.cronTime,
        context: client,
        onTick: function () {
          task.execute(this);
        },
        start: true,
      });

      console.log(
        `${text("⏱️ Successfully started")} ${variable(task.name)} ${text("task")}`
      );
    });
  },
};

export default event;

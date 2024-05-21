import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import type { Task } from "@/types";

export default (client: Client) => {
  const tasksDir = path.join(import.meta.dirname, "../tasks");

  fs.readdirSync(tasksDir).forEach(async (file) => {
    const { default: task }: { default: Task } = await import(`${tasksDir}/${file}`);
    client.tasks.set(task.name, task);
  });
};

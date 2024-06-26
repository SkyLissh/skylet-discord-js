import axios from "axios";

import { McServerSattusSchema } from "@/models/mc-server-status";

export const useMcServerStatus = async () => {
  const ip = process.env.MC_SERVER_IP;
  const res = await axios.get(`https://api.mcsrvstat.us/3/${ip}`);

  const status = McServerSattusSchema.parse(res.data);

  return status;
};

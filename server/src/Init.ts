import fs from "fs";
import path from "path";
import * as core from "express-serve-static-core";
import { IEmitEvents, IListenEvents } from "../../src/Shared/Type/Socket";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";

export default function InstallSocketIO() {
  const Connection = async (
    socket: Socket<IListenEvents, IEmitEvents, DefaultEventsMap, any>
  ) => {
    socket.emit("Connect");
  };

  SocketIO.on("connection", Connection);
}

export function InstallRoutings(Dir: string, Api: core.Express) {
  for (const File of fs.readdirSync(Dir)) {
    const DirTarget = path.join(Dir, File);
    const Stats = fs.statSync(DirTarget);
    if (Stats.isDirectory()) {
      InstallRoutings(DirTarget, Api);
    } else {
      const command = require(DirTarget) as {
        default: (Api: core.Express) => void;
      };
      command.default(Api);
    }
  }
}

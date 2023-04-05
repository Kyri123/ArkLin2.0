import { useEffect, useState } from "react";
import { API_ServerLib } from "../Lib/Api/API_Server.Lib";

export interface IArkServerLogsHook {
  LogFiles: Record<string, string>;
  LogContent: string;
  CurrentFile: string;
  RequestLogContent: (LogFile: string) => void;
  Init: boolean;
}

export function useArkServerLogs(InstanceName: string): IArkServerLogsHook {
  const [LogFiles, setLogFiles] = useState<Record<string, string>>({});
  const [LogContent, setLogContent] = useState("");
  const [ReqLogFile, setReqLogFile] = useState("?");
  const [Init, setInit] = useState(false);

  useEffect(() => {
    const GetLogFiles = async () => {
      setLogFiles(await API_ServerLib.GetLogFiles(InstanceName));
      setLogContent(
        await API_ServerLib.GetLogFromFile(InstanceName, ReqLogFile)
      );
      setInit(true);
    };

    GetLogFiles();
    const Timer = setInterval(GetLogFiles, 1000);
    return () => {
      /*setReqLogFile( "?" );
			 setLogContent( "" );*/
      setLogFiles({});
      setInit(false);
      clearInterval(Timer);
    };
  }, [InstanceName, ReqLogFile]);

  useEffect(() => {
    API_ServerLib.GetLogFiles(InstanceName).then((Data) => {
      if (Data["panel.txt"]) {
        setReqLogFile(Data["panel.txt"]);
        return;
      }
      const First = Object.values(Data)[0];
      if (First) {
        setReqLogFile(First);
      }
    });
  }, [InstanceName]);

  return {
    RequestLogContent: setReqLogFile,
    LogContent: LogContent,
    LogFiles: LogFiles,
    Init: Init,
    CurrentFile: ReqLogFile,
  };
}

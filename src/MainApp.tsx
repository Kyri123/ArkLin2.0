/** @format */

import React           from "react";
import type { Socket } from "socket.io-client";
import io              from "socket.io-client";
import { SocketIOLib } from "./Lib/Api/SocketIO.Lib";
import type {
	EmitEvents,
	ListenEvents
}                      from "./Shared/Type/Socket";

const P403 = React.lazy( () => import("@page/error/[statusCode]") );
const P404 = React.lazy( () => import("./Pages/error/P404") );

const PCluster = React.lazy(
	() => import("./Pages/MainApp/PCluster")
);
const PUsersettings = React.lazy(
	() => import("./Pages/MainApp/PUsersettings")
);
const PServer = React.lazy(
	() => import("./Pages/MainApp/PServer")
);
const PPanelsettings = React.lazy(
	() => import("./Pages/MainApp/PPanelsettings")
);
const PAdminServer = React.lazy(
	() => import("./Pages/MainApp/PAdminServer")
);
const PUsers = React.lazy(
	() => import("./Pages/MainApp/PUsers")
);
const CPanelLog = React.lazy(
	() => import("./Pages/MainApp/PageComponents/Page/CPanelLog")
);
const PHome = React.lazy(
	() => import("./Pages/MainApp/PHome")
);
const PChangelog = React.lazy(
	() => import("./Pages/MainApp/PChangelog")
);

const SocketIO : Socket<EmitEvents, ListenEvents> = io(
	SocketIOLib.GetSpocketHost()
);

export default function MainApp() {
}

/** @format */

import { SocketIOLib } from "@app/Lib/Api/SocketIO.Lib";
import {
    apiAuth,
    fireSwalFromApi
} from "@app/Lib/tRPC";
import type {
    EmitEvents,
    ListenEvents
} from "@app/Types/Socket";
import Foother from "@comp/PageLayout/Foother";
import LeftNavigation from "@comp/PageLayout/LeftNavigation";
import SideHeader from "@comp/PageLayout/SideHeader";
import TopNavigation from "@comp/PageLayout/TopNavigation";
import Traffics from "@comp/PageLayout/Traffics";
import PanelLog from "@comp/PanelLog";
import ServerContext from "@context/ServerContext";
import useAccount from "@hooks/useAccount";
import { useToggle } from "@kyri123/k-reactutils";
import type { LayoutLoaderProps } from "@page/app/loader/Layout";
import { fetchMainData } from "@page/app/loader/func/functions";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import type { SystemUsage } from "@server/MongoDB/MongoUsage";
import { EPerm } from "@shared/Enum/User.Enum";
import type { FunctionComponent } from "react";
import {
    useCallback,
    useEffect,
    useState
} from "react";
import {
    Outlet,
    useLoaderData
} from "react-router-dom";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";


const SocketIO: Socket<EmitEvents, ListenEvents> = io(
	SocketIOLib.getSocketHost()
);

const Component: FunctionComponent = () => {
	const { cluster, server, usage, globalState, hasError } = useLoaderData() as LayoutLoaderProps;
	const { user } = useAccount();
	const [ showLog, toggleshowLog ] = useToggle( false );
	const [ [ GameServerOnline, GameServerOffline, GameServerTotal ], setGameServerState ] = useState<number[]>( () => globalState );
	const [ SystemUsage, setSystemUsage ] = useState<SystemUsage>( () => usage );
	const [ HasData, setHasData ] = useState( () => !hasError );

	const [ Instances, setInstances ] = useState<Record<string, Instance>>( () => server );
	const [ Clusters, setClusters ] = useState<Record<string, Cluster>>( () => cluster );

	const getAllServer = useCallback( async() => {
		if( hasError ) {
			return;
		}

		const result = await fetchMainData();

		if( result ) {
			const [ globalState, server, cluster, usage ] = result;

			setSystemUsage( () => usage );
			setGameServerState( () => globalState );
			setClusters( () => cluster );
			setInstances( () => server );
		}
	}, [ hasError ] );

	useEffect( () => {
		if( hasError ) {
			return;
		}

		SocketIO.on( "onSystemUpdate", Usage => {
			setSystemUsage( () => Usage );
			apiAuth.globaleState.state.query().then( setGameServerState ).catch( () => {
			} );
		} );

		SocketIO.on( "onServerUpdated", R =>
			setInstances( I => ( {
				...I,
				...R
			} ) )
		);

		SocketIO.on( "onClusterUpdated", R =>
			setClusters( I => ( {
				...I,
				...R
			} ) )
		);

		SocketIO.on( "onClusterRemoved", getAllServer );
		SocketIO.on( "onServerRemoved", getAllServer );
		SocketIO.on( "connect", getAllServer );
		SocketIO.on( "disconnect", () => setHasData( false ) );

		return () => {
			SocketIO.off( "onClusterRemoved", getAllServer );
			SocketIO.off( "onClusterUpdated" );
			SocketIO.off( "connect" );
			SocketIO.off( "disconnect" );
			SocketIO.off( "onServerUpdated" );
			SocketIO.off( "onServerRemoved", getAllServer );
			SocketIO.off( "onSystemUpdate" );
		};
	}, [ getAllServer, hasError ] );

	// eslint-disable-next-line no-constant-condition
	if( hasError ) {
		fireSwalFromApi( "Api konnte nicht abgerufen werden! oder es ist ein fehler aufgetretten. Bitte lade die seite erneut!", false, { timer: undefined } );
		return ( <></> );
	}

	return (
		<>
			<ServerContext.Provider value={ { InstanceData: Instances, HasData: HasData, ClusterData: Clusters, getAllServer } }>
				<main className="d-flex flex-nowrap w-100">
					<LeftNavigation />
					<div className="flex-fill d-flex flex-column w-100">
						<div className="flex-grow-0">
							<TopNavigation showLog={ toggleshowLog }
								ServerState={ [ GameServerOnline, GameServerOffline ] }
								SystemUsage={ SystemUsage } />
						</div>

						<div className="flex-grow-0">
							<SideHeader />
						</div>

						<div className="flex-auto h-100 overflow-y-scroll overflow-x-hidden">
							<section className="content p-3 h-100 pt-0 pb-0">
								<div className="py-3">
									<Traffics SystemUsage={ SystemUsage }
										ServerState={ [
											GameServerOnline,
											GameServerOffline,
											GameServerTotal
										] } />

									<Outlet />
								</div>
							</section>
						</div>

						<div className="flex-grow-0">
							<Foother SystemUsage={ SystemUsage } />
						</div>
					</div>
				</main>

				{ user.hasPermission( EPerm.PanelLog ) &&
					<PanelLog usage={ SystemUsage } Show={ showLog } onHide={ toggleshowLog } /> }
			</ServerContext.Provider>
		</>
	);
};

export { Component };


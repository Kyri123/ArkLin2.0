/** @format */

import type { SystemUsage } from "@/server/src/MongoDB/MongoUsage";
import { SocketIOLib } from "@/src/Lib/Api/SocketIO.Lib";
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


const socket: Socket<EmitEvents, ListenEvents> = io(
	SocketIOLib.getSocketHost()
);

const Component: FunctionComponent = () => {
	const { cluster, server, usage, globalState, hasError } = useLoaderData() as LayoutLoaderProps;
	const { user } = useAccount();
	const [ showLog, toggleshowLog ] = useToggle( false );
	const [ [ gameServerOnline, gameServerOffline, gameServerTotal ], setGameServerState ] = useState<number[]>( () => globalState );
	const [ systemUsage, setSystemUsage ] = useState<SystemUsage>( () => usage );
	const [ hasData, setHasData ] = useState( () => !hasError );

	const [ instances, setInstances ] = useState<Record<string, Instance>>( () => server );
	const [ clusters, setClusters ] = useState<Record<string, Cluster>>( () => cluster );

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

		socket.on( "onSystemUpdate", Usage => {
			setSystemUsage( () => Usage );
			apiAuth.globaleState.state.query().then( setGameServerState ).catch( () => {
			} );
		} );

		socket.on( "onServerUpdated", R =>
			setInstances( I => ( {
				...I,
				...R
			} ) )
		);

		socket.on( "onClusterUpdated", R =>
			setClusters( I => ( {
				...I,
				...R
			} ) )
		);

		socket.on( "onClusterRemoved", getAllServer );
		socket.on( "onServerRemoved", getAllServer );
		socket.on( "connect", getAllServer );
		socket.on( "disconnect", () => setHasData( false ) );

		return () => {
			socket.off( "onClusterRemoved", getAllServer );
			socket.off( "onClusterUpdated" );
			socket.off( "connect" );
			socket.off( "disconnect" );
			socket.off( "onServerUpdated" );
			socket.off( "onServerRemoved", getAllServer );
			socket.off( "onSystemUpdate" );
		};
	}, [ getAllServer, hasError ] );

	// eslint-disable-next-line no-constant-condition
	if( hasError ) {
		fireSwalFromApi( "Api konnte nicht abgerufen werden! oder es ist ein fehler aufgetretten. Bitte lade die seite erneut!", false, { timer: undefined } );
		return ( <></> );
	}

	return (
		<>
			<ServerContext.Provider value={ { instanceData: instances, hasData, clusterData: clusters, getAllServer } }>
				<main className="d-flex flex-nowrap w-100">
					<LeftNavigation />
					<div className="flex-fill d-flex flex-column w-100">
						<div className="flex-grow-0">
							<TopNavigation showLog={ toggleshowLog }
								ServerState={ [ gameServerOnline, gameServerOffline ] }
								SystemUsage={ systemUsage } />
						</div>

						<div className="flex-grow-0">
							<SideHeader />
						</div>

						<div className="flex-auto h-100 overflow-y-scroll overflow-x-hidden">
							<section className="content p-3 h-100 pt-0 pb-0">
								<div className="py-3">
									<Traffics SystemUsage={ systemUsage }
										ServerState={ [
											gameServerOnline,
											gameServerOffline,
											gameServerTotal
										] } />

									<Outlet />
								</div>
							</section>
						</div>

						<div className="flex-grow-0">
							<Foother SystemUsage={ systemUsage } />
						</div>
					</div>
				</main>

				{ user.hasPermission( EPerm.PanelLog ) &&
					<PanelLog usage={ systemUsage } Show={ showLog } onHide={ toggleshowLog } /> }
			</ServerContext.Provider>
		</>
	);
};

export { Component };


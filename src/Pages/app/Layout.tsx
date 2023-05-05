/** @format */

import {
	Outlet,
	useLoaderData
}                                 from "react-router-dom";
import type { FunctionComponent } from "react";
import {
	useCallback,
	useEffect,
	useState
}                                 from "react";
import ServerContext              from "@context/ServerContext";
import LeftNavigation             from "@comp/PageLayout/LeftNavigation";
import TopNavigation              from "@comp/PageLayout/TopNavigation";
import SideHeader                 from "@comp/PageLayout/SideHeader";
import Traffics                   from "@comp/PageLayout/Traffics";
import Foother                    from "@comp/PageLayout/Foother";
import type { Socket }            from "socket.io-client";
import io                         from "socket.io-client";
import { SocketIOLib }            from "@app/Lib/Api/SocketIO.Lib";
import type { SystemUsage }       from "@server/MongoDB/DB_Usage";
import type {
	EmitEvents,
	ListenEvents
}                                 from "@app/Types/Socket";
import type { Instance }          from "@server/MongoDB/DB_Instances";
import type { Cluster }           from "@server/MongoDB/DB_Cluster";
import type { LayoutLoaderProps } from "@page/app/loader/Layout";
import { useToggle }              from "@kyri123/k-reactutils";
import { fetchMainData }          from "@page/app/loader/func/functions";
import {
	fireSwalFromApi,
	tRPC_Auth
}                                 from "@app/Lib/tRPC";
import { EPerm }                  from "@shared/Enum/User.Enum";
import useAccount                 from "@hooks/useAccount";
import PanelLog                   from "@comp/PanelLog";

const SocketIO : Socket<EmitEvents, ListenEvents> = io(
	SocketIOLib.GetSpocketHost()
);

const Component : FunctionComponent = () => {
	const { cluster, server, usage, globalState, hasError } = useLoaderData() as LayoutLoaderProps;
	const { user } = useAccount();
	const [ ShowLog, toggleShowLog ] = useToggle( false );
	const [ [ GameServerOnline, GameServerOffline, GameServerTotal ], setGameServerState ] = useState<number[]>( () => globalState );
	const [ SystemUsage, setSystemUsage ] = useState<SystemUsage>( () => usage );
	const [ HasData, setHasData ] = useState( () => !hasError );

	const [ Instances, setInstances ] = useState<Record<string, Instance>>( () => server );
	const [ Clusters, setClusters ] = useState<Record<string, Cluster>>( () => cluster );

	const GetAllServer = useCallback( async() => {
		if ( hasError ) {
			return;
		}

		const result = await fetchMainData();

		if ( result ) {
			const [ globalState, server, cluster, usage ] = result;

			setSystemUsage( () => usage );
			setGameServerState( () => globalState );
			setClusters( () => cluster );
			setInstances( () => server );
		}
	}, [ hasError ] );

	useEffect( () => {
		if ( hasError ) {
			return;
		}

		SocketIO.on( "OnSystemUpdate", ( Usage ) => {
			setSystemUsage( Usage );
			tRPC_Auth.globaleState.state.query().then( setGameServerState ).catch( () => {
			} );
		} );

		SocketIO.on( "OnServerUpdated", ( R ) =>
			setInstances( ( I ) => ( {
				...I,
				...R
			} ) )
		);

		SocketIO.on( "OnClusterUpdated", ( R ) =>
			setClusters( ( I ) => ( {
				...I,
				...R
			} ) )
		);

		SocketIO.on( "OnClusterRemoved", GetAllServer );
		SocketIO.on( "OnServerRemoved", GetAllServer );
		SocketIO.on( "connect", GetAllServer );
		SocketIO.on( "disconnect", () => setHasData( false ) );

		return () => {
			SocketIO.off( "OnClusterRemoved", GetAllServer );
			SocketIO.off( "OnClusterUpdated" );
			SocketIO.off( "connect" );
			SocketIO.off( "disconnect" );
			SocketIO.off( "OnServerUpdated" );
			SocketIO.off( "OnServerRemoved", GetAllServer );
			SocketIO.off( "OnSystemUpdate" );
		};
	}, [ GetAllServer, hasError ] );

	// eslint-disable-next-line no-constant-condition
	if ( hasError ) {
		fireSwalFromApi( "Api konnte nicht abgerufen werden! oder es ist ein fehler aufgetretten. Bitte lade die seite erneut!", false, { timer: undefined } );
		return ( <></> );
	}

	return (
		<>
			<ServerContext.Provider
				value={ { InstanceData: Instances, HasData: HasData, ClusterData: Clusters } }
			>
				<main className="d-flex flex-nowrap w-100">
					<LeftNavigation/>
					<div className="flex-fill d-flex flex-column w-100">
						<div className="flex-grow-0">
							<TopNavigation
								ShowLog={ toggleShowLog }
								ServerState={ [ GameServerOnline, GameServerOffline ] }
								SystemUsage={ SystemUsage }
							/>
						</div>

						<div className="flex-grow-0">
							<SideHeader/>
						</div>

						<div className="flex-auto h-100 overflow-y-scroll overflow-x-hidden">
							<section
								className="content p-3 h-100 pt-0 pb-0">
								<div className="py-3">
									<Traffics
										SystemUsage={ SystemUsage }
										ServerState={ [
											GameServerOnline,
											GameServerOffline,
											GameServerTotal
										] }
									/>

									<Outlet/>
								</div>
							</section>
						</div>

						<div className="flex-grow-0">
							<Foother SystemUsage={ SystemUsage }/>
						</div>
					</div>
				</main>

				{ user.HasPermission( EPerm.PanelLog ) && <PanelLog Show={ ShowLog } OnHide={ toggleShowLog }/> }
			</ServerContext.Provider>
		</>
	);
};

export { Component };

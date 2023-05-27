import { fetchMainData } from "@page/app/loader/func/functions";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import type { SystemUsage } from "@server/MongoDB/MongoUsage";
import { defaultSystemUsage } from "@shared/Default/Server.Default";
import type { LoaderFunction } from "react-router-dom";
import { json } from "react-router-dom";


export interface LayoutLoaderProps {
	globalState: number[],
	server: Record<string, Instance>,
	cluster: Record<string, Cluster>,
	usage: SystemUsage,
	hasError?: boolean
}


const loader: LoaderFunction = async() => {
	const result = await fetchMainData();

	if( result ) {
		const [ globalState, server, cluster, usage ] = result;
		return json<LayoutLoaderProps>( { globalState, server, cluster, usage } );
	}

	return json<LayoutLoaderProps>( {
		globalState: [ 0, 0, 0 ],
		server: {},
		cluster: {},
		usage: defaultSystemUsage(),
		hasError: true
	} );
};

export { loader };


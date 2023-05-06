import type { LoaderFunction } from "react-router-dom";
import { json }                from "react-router-dom";
import type { Instance }       from "@server/MongoDB/DB_Instances";
import type { Cluster }        from "@server/MongoDB/DB_Cluster";
import type { SystemUsage }    from "@server/MongoDB/DB_Usage";
import { DefaultSystemUsage }  from "@shared/Default/Server.Default";
import { fetchMainData }       from "@page/app/loader/func/functions";

export interface LayoutLoaderProps {
	globalState : number[],
	server : Record<string, Instance>,
	cluster : Record<string, Cluster>,
	usage : SystemUsage,
	hasError? : boolean,
}

 
const loader : LoaderFunction = async() => {
	const result = await fetchMainData();

	if ( result ) {
		const [ globalState, server, cluster, usage ] = result;
		return json<LayoutLoaderProps>( { globalState, server, cluster, usage } );
	}

	return json<LayoutLoaderProps>( {
		globalState: [ 0, 0, 0 ],
		server: {},
		cluster: {},
		usage: DefaultSystemUsage(),
		hasError: true
	} );
};

export { loader };
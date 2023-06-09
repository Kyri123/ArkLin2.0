import {
	createTRPCProxyClient,
	httpBatchLink,
	TRPCClientError
}                    from "@trpc/client";
import type {
	AuthRouter,
	PublicRouter
}                    from "@server/trpc/server";
import type {
	SweetAlertIcon,
	SweetAlertOptions
}                    from "sweetalert2";
import Swal          from "sweetalert2";
import superjson     from "superjson";
import { AUTHTOKEN } from "@app/Lib/constance";

export async function onConfirm<PreConfirmResult = any>( msg : string, moreOptions? : SweetAlertOptions<PreConfirmResult> ) : Promise<boolean> {
	const accept = await fireSwalFromApi( msg, "question", {
		showConfirmButton: true,
		showCancelButton: true,
		confirmButtonText: "Ja",
		cancelButtonText: "Nein",
		timer: 5000,
		...moreOptions
	} );
	return !!accept?.isConfirmed;
}

export function successSwal( msg : string, toast? : boolean ) : void {
	if ( toast ) {
		fireToastFromApi( msg, "success" );
		return;
	}
	fireSwalFromApi( msg, "success" );
}

export function fireSwalFromApi<PreConfirmResult = any>( message : string[] | string | undefined, success? : boolean | SweetAlertIcon, moreOptions? : SweetAlertOptions<PreConfirmResult> ) {
	if ( message && message.length >= 0 ) {
		return Swal.fire<PreConfirmResult>( {
			html: Array.isArray( message ) ? message.join( "<br />" ) : message,
			icon: typeof success === "string" ? success : ( success ? "success" : "error" ),
			showConfirmButton: false,
			timerProgressBar: true,
			timer: 3000,
			...moreOptions
		} );
	}
	return null;
}

export function fireToastFromApi<PreConfirmResult = any>( message : string[] | string | undefined, success? : boolean | SweetAlertIcon, moreOptions? : SweetAlertOptions<PreConfirmResult> ) {
	if ( message && message.length >= 0 ) {
		return Swal.fire( {
			position: "bottom-end",
			toast: true,
			html: Array.isArray( message ) ? message.join( "<br />" ) : message,
			icon: typeof success === "string" ? success : ( success ? "success" : "error" ),
			showConfirmButton: false,
			timerProgressBar: true,
			timer: 3000,
			...moreOptions
		} );
	}
	return null;
}


export const tRPC_token = () => window.localStorage.getItem( AUTHTOKEN ) || "";

export const tRPC_Public = createTRPCProxyClient<PublicRouter>( {
	transformer: superjson,
	links: [
		httpBatchLink( {
			url: "/api/v2/public"
		} )
	]
} );

export const tRPC_Auth = createTRPCProxyClient<AuthRouter>( {
	transformer: superjson,
	links: [
		httpBatchLink( {
			url: "/api/v2/auth",
			headers: () => {
				return {
					Authorization: `Bearer ${ tRPC_token() }`
				};
			}
		} )
	]
} );

export const tRPC_handleError = ( e : any, asToast? : boolean ) => {
	if ( e instanceof TRPCClientError ) {
		let message : string | string[] = e.message;
		try {
			const asArray : any[] = JSON.parse( e.message );
			message = asArray.map( msg => msg.message );
		}
		catch ( err ) {
		}

		if ( !asToast ) {
			fireSwalFromApi( message );
		}
		else {
			fireToastFromApi( message );
		}
	}
	else {
		fireToastFromApi( "Etwas ist schief gelaufen..." );
	}
};
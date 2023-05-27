import type { Response } from "express-serve-static-core";
import superjson from "superjson";


interface OpenApiErrorResponse {
	"message": string,
	"code": number,
	"data": {
		"code": string,
		"httpStatus": number,
		"path": string
	}
}

export function errorResponse( message: string | undefined, res: Response ): any {
	const resp: OpenApiErrorResponse = {
		"message": message || "something went wrong",
		"code": -32603,
		"data": {
			"code": "INTERNAL_SERVER_ERROR",
			"httpStatus": res.statusCode,
			"path": res.req.path
		}
	};
	return { error: JSON.parse( superjson.stringify( resp ) ) };
}

export function dataResponse<T>( data: T ): any {
	return { result: { data: JSON.parse( superjson.stringify( data ) ) } };
}

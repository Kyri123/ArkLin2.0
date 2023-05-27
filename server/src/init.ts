import type * as core from "express-serve-static-core";
import fs from "fs";
import path from "path";
import { SystemLibClass } from "./Lib/system.Lib";


if( !global.SystemLib ) {
	global.SystemLib = new SystemLibClass();
}

export function installRoutings( Dir: string, Api: core.Express ) {
	for( const file of fs.readdirSync( Dir ) ) {
		const dirTarget = path.join( Dir, file );
		const stats = fs.statSync( dirTarget );
		if( stats.isDirectory() ) {
			installRoutings( dirTarget, Api );
		} else {
			const command = require( dirTarget ) as{
				default: ( Api: core.Express ) => void
			};
			command.default( Api );
		}
	}
}

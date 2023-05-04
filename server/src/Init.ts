import fs                  from "fs";
import path                from "path";
import type * as core           from "express-serve-static-core";
import { SystemLib_Class } from "./Lib/System.Lib";

if ( !global.SystemLib ) {
	global.SystemLib = new SystemLib_Class( [ "Lin" ] );
}
 
export function InstallRoutings( Dir : string, Api : core.Express ) {
	for ( const File of fs.readdirSync( Dir ) ) {
		const DirTarget = path.join( Dir, File );
		const Stats = fs.statSync( DirTarget );
		if ( Stats.isDirectory() ) {
			InstallRoutings( DirTarget, Api );
		}
		else {
			const command = require( DirTarget ) as {
				default : ( Api : core.Express ) => void;
			};
			command.default( Api );
		}
	}
}

import type React          from "react";
import { useArkServer }    from "@hooks/useArkServer";
import { Link }            from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton }      from "@comp/Elements/Buttons";
import type { SteamMod }   from "@server/MongoDB/DB_SteamAPI_Mods";
import _                   from "lodash";
import { onConfirm }       from "@app/Lib/tRPC";

interface IProps {
	setMods : ( mods : number[], asToast? : boolean ) => Promise<void>,
	allMods : number[],
	isSending : boolean;
	ModId : number;
	ModData : SteamMod | undefined;
	InstanceName : string;
	ModIndex : number;
}

const PCServerModsRow : React.FunctionComponent<IProps> = ( {
	setMods,
	allMods,
	isSending,
	ModId,
	ModData,
	InstanceName,
	ModIndex
} ) => {
	const { Data } = useArkServer( InstanceName );
	const RemoveMod = async() => {
		if ( await onConfirm( "Möchtest du diese mod wirklich entfernen?" ) ) {
			const mods = _.clone( allMods );
			mods.splice( ModIndex, 1 );
			await setMods( mods );
		}
	};

	const MoveMod = async( IndexOffset : 1 | -1 ) => {
		if ( ModIndex + IndexOffset >= 0 && ModIndex + IndexOffset < allMods.length ) {
			const mods = _.clone( allMods );
			mods.swapElements( ModIndex, ModIndex + IndexOffset );
			await setMods( mods, true );
		}
	};


	return (
		<tr>
			<td width="20px" className="p-0">
				<IconButton
					IsLoading={ isSending }
					variant={ "gray-dark" }
					ForceDisable={ !( ModIndex - 1 >= 0 ) }
					onClick={ () => MoveMod( -1 ) }
					className="btn btn-sm flat text-bg-dark m-0"
				>
					<FontAwesomeIcon icon={ "arrow-up" }/>
				</IconButton>
				<IconButton
					IsLoading={ isSending }
					variant={ "gray-dark" }
					onClick={ () => MoveMod( 1 ) }
					ForceDisable={ ModIndex + 1 > Data.ark_GameModIds.length - 1 }
					className="btn btn-sm flat text-bg-dark m-0"
				>
					<FontAwesomeIcon icon={ "arrow-down" }/>
				</IconButton>
			</td>
			<td width="62px" className="p-0">
				<img
					alt={ ModData?.title || "Warte auf SteamAPI daten..." }
					src={ ModData?.preview_url || "/img/logo/unknown.png" }
					style={ { width: 62, height: 62 } }
				/>
			</td>
			<td className={ "pt-1 pb-1" }>
				<b>
					[{ ModId }] { ModData?.title || "Warte auf SteamAPI daten..." }
				</b>{ " " }
				<br/>
				<span className="text-sm">
          ModID:{ " " }
					<Link
						to={ `https://steamcommunity.com/sharedfiles/filedetails/?id=${ ModId }` }
						className="text-bold"
						target="_blank"
					>
            { ModId }
          </Link>{ " " }
					| Letzes Update:{ " " }
					<b>
            { ModData
	            ? new Date( ModData.time_updated ).toLocaleString()
	            : "??.??.???? ??:??:??" }
          </b>
        </span>
			</td>
			<td style={ { width: 0 } } className="p-0">
				<div className="btn-group">
					<IconButton
						IsLoading={ isSending }
						className="btn btn-danger m-0 flat"
						onClick={ RemoveMod }
					>
						<FontAwesomeIcon icon={ "trash-alt" }/> Entfernen
					</IconButton>
				</div>
			</td>
		</tr>
	);
};

export default PCServerModsRow;

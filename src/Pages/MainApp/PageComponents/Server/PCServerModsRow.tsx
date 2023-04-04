import React, {
	useContext,
	useState
}                           from 'react';
import { ISteamApiMod }     from "../../../../Shared/Api/SteamAPI";
import { useArkServer }     from "../../../../Hooks/useArkServer";
import { API_ServerLib }    from "../../../../Lib/Api/API_Server.Lib";
import AlertContext         from "../../../../Context/AlertContext";
import { Link }             from "react-router-dom";
import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import { LTELoadingButton } from "../../../../Components/Elements/AdminLTE/AdminLTE_Buttons";

interface IProps {
	ModId : number,
	ModData : ISteamApiMod | undefined;
	InstanceName : string;
	ModIndex : number;
}

const PCServerModsRow : React.FunctionComponent<IProps> = ( { ModId, ModData, InstanceName, ModIndex } ) => {
	const { DoSetAlert } = useContext( AlertContext );
	const { Data, TempModify } = useArkServer( InstanceName );
	const [ IsSending, setIsSending ] = useState( false );
	const [ IsSendingMove, setIsSendingMove ] = useState( false );

	const RemoveMod = async() => {
		setIsSending( true );

		if ( !Data.ark_GameModIds.includes( ModId ) ) {
			DoSetAlert( {
				Success: false,
				Auth: true,
				Message: {
					Message: `Die Mod mit der ID ${ ModId } wurde bereits entfernt!`,
					Title: "Achtung!",
					AlertType: "warning"
				}
			} )
			setIsSending( false );
			return;
		}

		const CopyData = {
			...Data
		}

		CopyData.ark_GameModIds = [ ...new Set( CopyData.ark_GameModIds.filter( E => E !== ModId ) ) ];
		const Result = await API_ServerLib.SetServerConfig( InstanceName, "Arkmanager.cfg", CopyData );
		if ( Result.Success ) {
			TempModify( Current => ( {
				...Current,
				ArkmanagerCfg: CopyData
			} ) );
		}
		DoSetAlert( Result );

		setIsSending( false );
	}

	const MoveMod = async( IndexOffset : 1 | -1 ) => {
		setIsSendingMove( true );

		const NewIndex = Math.max( 0, Math.min( Data.ark_GameModIds.length - 1, IndexOffset + ModIndex ) )

		const CopyData = {
			...Data
		}
		const ID = CopyData.ark_GameModIds.splice( ModIndex, 1 )[ 0 ];
		CopyData.ark_GameModIds.splice( NewIndex, 0, ID );

		CopyData.ark_GameModIds = [ ...new Set( CopyData.ark_GameModIds ) ];
		const Result = await API_ServerLib.SetServerConfig( InstanceName, "Arkmanager.cfg", CopyData );
		if ( Result.Success ) {
			TempModify( Current => ( {
				...Current,
				ArkmanagerCfg: CopyData
			} ) );
		}
		DoSetAlert( Result );

		setIsSendingMove( false );
	}

	return (
		<tr>
			<td width="20px" className="p-0">
				<LTELoadingButton IsLoading={ IsSendingMove } id="FB_upload" BtnColor={ "gray-dark" }
								  Disabled={ ModIndex - 1 < 0 }
								  onClick={ () => MoveMod( -1 ) }
								  className="btn btn-sm btn-flat text-bg-dark m-0">
					<FontAwesomeIcon icon={ "arrow-up" }/>
				</LTELoadingButton>
				<LTELoadingButton IsLoading={ IsSendingMove } id="FB_upload" BtnColor={ "gray-dark" }
								  onClick={ () => MoveMod( 1 ) }
								  Disabled={ ModIndex + 1 > Data.ark_GameModIds.length - 1 }
								  className="btn btn-sm btn-flat text-bg-dark m-0">
					<FontAwesomeIcon icon={ "arrow-down" }/>
				</LTELoadingButton>
			</td>
			<td width="62px" className="p-0">
				<img alt={ ModData?.title || "Warte auf SteamAPI daten..." }
					 src={ ModData?.preview_url || "/img/logo/unknown.png" } style={ { width: 62, height: 62 } }/>
			</td>
			<td className={ "pt-1 pb-1" }>
				<b>[{ ModId }] { ModData?.title || "Warte auf SteamAPI daten..." }</b> <br/>
				<span className="text-sm">ModID: <Link
					to={ `https://steamcommunity.com/sharedfiles/filedetails/?id=${ ModId }` } className="text-bold"
					target="_blank">{ ModId }</Link> | Letzes Update: <b>{ ModData ? new Date( ModData.time_updated ).toLocaleString() : "??.??.???? ??:??:??" }</b></span>
			</td>
			<td style={ { width: 0 } } className="p-0">
				<div className="btn-group">
					<LTELoadingButton IsLoading={ IsSending } className="btn btn-danger m-0"
									  onClick={ RemoveMod }>
						<FontAwesomeIcon icon={ "trash-alt" }/> Entfernen
					</LTELoadingButton>
				</div>
			</td>
		</tr>
	)
};

export default PCServerModsRow;

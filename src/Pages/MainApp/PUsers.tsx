import {
	useContext,
	useEffect,
	useState
}                                from "react";
import {
	ButtonGroup,
	Card,
	Modal
}                                from "react-bootstrap";
import { FontAwesomeIcon }       from "@fortawesome/react-fontawesome";
import {
	LTELoadingButton,
	LTEToggleButton
}                                from "../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { EPerm }                 from "../../Shared/Enum/User.Enum";
import { API_User }              from "../../Lib/Api/API_User";
import CPageCounter              from "./PageComponents/General/CPageCounter";
import type { IAPIResponseBase } from "../../Shared/Type/API_Response";
import { CAlert }                from "./PageComponents/General/CAlert";
import { useCopy }               from "@kyri123/k-reactutils";
import type {
	IMO_AccountKey,
	UserAccount
}                                from "../../Types/MongoDB";
import usePermissionPage         from "../../Hooks/usePermissionPage";
import PCUserRow                 from "./PageComponents/Users/PCUserRow";
import AlertContext              from "../../Context/AlertContext";
import AccountContext            from "../../Context/AccountContext";

export default function PUsers() {
	const { DoSetAlert, setAcceptAction } = useContext( AlertContext );
	const Account = useContext( AccountContext );
	usePermissionPage( EPerm.Super );

	const [ ShowKeys, setShowKeys ] = useState( false );
	const [ IsSending, setIsSending ] = useState( {
		Delete: {
			IsKey: false,
			Id: ""
		},
		SendRangEdit: "",
		RemoveAllowedServer: "",
		IsSendingServerEdit: false,
		IsSendingAddAllowed: false,
		IsAddingKey: false
	} );
	const [ KeyAsAdmin, setKeyAsAdmin ] = useState( false );

	const [ KeyAlert, setKeyAlert ] = useState<IAPIResponseBase | undefined>(
		undefined
	);

	const [ UserData, setUserData ] = useState<UserAccount[]>( [] );
	const [ ShowUserData, setShowUserData ] = useState<UserAccount[]>( [] );

	const [ AccountKey, setAccountKey ] = useState<IMO_AccountKey[]>( [] );
	const [ ShowAccountKey, setShowAccountKey ] = useState<IMO_AccountKey[]>( [] );

	const [ DoCopy, IsCopied ] = useCopy<string>( undefined );

	const ReadUserData = async() => {
		setUserData( await API_User.GetAllUsers( Account.Account.GetDBInformation() ) );
	};

	const ReadAccountKey = async() => {
		setAccountKey( await API_User.GetAllKeys() );
	};

	const Remove = async( Id : string, IsKey = false ) => {
		setIsSending( ( R ) => ( {
			...R,
			Delete: {
				IsKey: IsKey,
				Id: Id
			}
		} ) );

		const Response = IsKey
			? await API_User.RemoveKey( Id )
			: await API_User.RemoveAccount( Id );
		if ( Response.Success && IsKey ) {
			await ReadAccountKey();
		}
		else if ( Response.Success ) {
			await ReadUserData();
		}

		if ( IsKey ) {
			setKeyAlert( Response );
		}
		else {
			DoSetAlert( Response );
		}

		setIsSending( ( R ) => ( {
			...R,
			Delete: {
				IsKey: false,
				Id: ""
			}
		} ) );
	};

	useEffect( () => {
		ReadUserData();
		ReadAccountKey();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const CreateAccountKey = async() => {
		setIsSending( ( V ) => {
			V.IsAddingKey = true;
			return V;
		} );

		const Response = await API_User.AddKey( KeyAsAdmin );
		if ( Response.Success ) {
			setKeyAsAdmin( false );
			await ReadAccountKey();
		}
		setKeyAlert( Response );

		setIsSending( ( V ) => {
			V.IsAddingKey = false;
			return V;
		} );
	};

	return (
		<>
			<Card>
				<ButtonGroup>
					<LTELoadingButton IsLoading={ false } onClick={ () => setShowKeys( true ) }>
						<FontAwesomeIcon icon={ "key" }/> Account Keys
					</LTELoadingButton>
				</ButtonGroup>
			</Card>
			<table className={ "table table-striped w-100 border" }>
				<thead>
				<tr>
					<th>Id</th>
					<th>User</th>
					<th>E-Mail</th>
					<th style={ { width: 0 } }>Actions</th>
				</tr>
				</thead>
				<tbody>
				{ ShowUserData.map( ( User, Index ) => (
					<PCUserRow
						User={ User }
						key={ "ACCOUNT" + Index }
						Remove={ Remove }
						UpdateUsers={ ReadUserData }
					/>
				) ) }
				</tbody>
			</table>
			<CPageCounter<UserAccount>
				PerPage={ 20 }
				OnSetPage={ setShowUserData }
				Data={ UserData }
			/>

			<Modal
				size="lg"
				show={ ShowKeys }
				onHide={ () => {
					setShowKeys( false );
					setKeyAlert( undefined );
				} }
			>
				<Modal.Header closeButton>
					<Modal.Title id="example-modal-sizes-title-sm">
						Account Keys
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className={ "p-0" }>
					<CAlert
						className={ "m-0 rounded-0" }
						Data={ KeyAlert }
						OnClear={ () => setKeyAlert( undefined ) }
					/>
					<table className={ "table table-striped w-100 m-0" }>
						<thead>
						<tr>
							<th>Key</th>
							<th>Rolle</th>
							<th style={ { width: 0 } }>Aktionen</th>
						</tr>
						</thead>
						<tbody>
						{ ShowAccountKey.map( ( Key, Index ) => (
							<tr key={ "KEY" + Index }>
								<td>{ Key.key }</td>
								<td>{ Key.asSuperAdmin ? "Super Admin" : "Member" }</td>
								<td style={ { width: 0 } } className="p-2">
									<ButtonGroup>
										<LTELoadingButton
											onClick={ () =>
												setAcceptAction( {
													Payload: Remove,
													PayloadArgs: [ Key._id, true ],
													ActionTitle: `Möchtest du den Key ${ Key.key } wirklich löschen?`
												} )
											}
											className={ "btn-sm flat" }
											IsLoading={
												IsSending.Delete.IsKey &&
												IsSending.Delete.Id === Key._id
											}
											variant="danger"
										>
											<FontAwesomeIcon icon={ "trash-alt" }/>
										</LTELoadingButton>
										<LTELoadingButton
											disabled={ IsCopied( Key._id ) }
											onClick={ () => DoCopy( Key.key, Key._id ) }
											className={ "btn-sm flat" }
											IsLoading={ false }
											variant="success"
										>
											<FontAwesomeIcon
												icon={ IsCopied( Key._id ) ? "check" : "copy" }
											/>
										</LTELoadingButton>
									</ButtonGroup>
								</td>
							</tr>
						) ) }
						</tbody>
					</table>
				</Modal.Body>
				<Modal.Footer>
					<CPageCounter<IMO_AccountKey>
						PerPage={ 8 }
						OnSetPage={ setShowAccountKey }
						Data={ AccountKey }
					/>
					<Card className={ "m-0" }>
						<div className="input-group">
							<div className="input-group-append">
								<LTEToggleButton
									className={ "btn-sm" }
									Value={ KeyAsAdmin }
									OnToggle={ setKeyAsAdmin }
								>
									{ " " }
									{ KeyAsAdmin ? "Super Admin" : "Member" }
								</LTEToggleButton>
								<LTELoadingButton
									onClick={ CreateAccountKey }
									className={ "btn-sm flat" }
									IsLoading={ IsSending.IsAddingKey }
									variant="success"
								>
									<FontAwesomeIcon icon={ "plus" }/> Key Erstellen
								</LTELoadingButton>
							</div>
						</div>
					</Card>
				</Modal.Footer>
			</Modal>
		</>
	);
}

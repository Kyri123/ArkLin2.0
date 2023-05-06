import type React              from "react";
import {
	useEffect,
	useMemo,
	useRef,
	useState
}                              from "react";
import { useArkServerConfigs } from "@hooks/useArkServerConfigs";
import {
	Alert,
	ButtonGroup,
	Card
}                              from "react-bootstrap";
import type { SingleValue }    from "react-select";
import Select                  from "react-select";
import { IconButton }          from "@comp/Elements/Buttons";
import { FontAwesomeIcon }     from "@fortawesome/react-fontawesome";
import CodeMirror              from "@uiw/react-codemirror";
import { json }                from "@codemirror/lang-json";
import {
	defaultSettingsGruvboxDark,
	gruvboxDarkInit
}                              from "@uiw/codemirror-theme-gruvbox-dark";
import { useParams }           from "react-router-dom";
import {
	successSwal,
	tRPC_Auth,
	tRPC_handleError
}                              from "@app/Lib/tRPC";


const Component = () => {
	const { instanceName } = useParams();
	const {
		RequestConfigContent,
		ConfigFiles,
		ConfigContent,
		CurrentFile
	} = useArkServerConfigs( instanceName! );
	const [ content, setContent ] = useState( "" );
	const [ JsonError, setJsonError ] = useState( "" );
	const [ IsSending, setIsSending ] = useState( false );
	const codeMirrorRef = useRef<string>( "" );

	useEffect( () => {
		if ( ConfigContent ) {
			setContent( ConfigContent );
			codeMirrorRef.current = ConfigContent;
		}
	}, [ ConfigContent ] );

	useEffect( () => {
		if ( Object.keys( ConfigFiles ).length > 0 ) {
			RequestConfigContent( Object.values( ConfigFiles )[ 0 ] );
		}
	}, [ ConfigFiles ] );

	const GetOptions = useMemo( () => {
		const Return : { value : string; label : string }[] = [];
		for ( const [ FilePath, File ] of Object.entries( ConfigFiles ) ) {
			Return.push( {
				value: File,
				label: FilePath
			} );
		}
		return Return;
	}, [ ConfigFiles ] );

	const SetOption = (
		NewValue : SingleValue<{ value : string; label : string }>
	) => {
		if ( NewValue ) {
			RequestConfigContent( NewValue.value );
		}
	};

	const SaveConfig = async() => {
		setIsSending( true );

		await tRPC_Auth.server.config.updateConfigClearText.mutate( {
			instanceName: instanceName!,
			content: codeMirrorRef.current,
			file: CurrentFile
		} ).then( successSwal ).catch( tRPC_handleError );

		setIsSending( false );
	};

	return (
		<Card>
			<Card.Header className={ "p-0" }>
				<div className="d-flex bd-highlight w-100">
					<div className="p-0 flex-grow-1 bd-highlight">
						<h3 className="card-title p-3">Server Konfiguration</h3>
					</div>
					<div className="p-2 flex-grow-1 bd-highlight">
						<Select
							className={ "w-100" }
							options={ GetOptions }
							value={ {
								value: CurrentFile || "",
								label: CurrentFile.split( "/" ).pop() || ""
							} }
							onChange={ E => {
								SetOption( E );
							} }
						/>
					</div>
				</div>
			</Card.Header>
			<Card.Header className={ "p-0" }>
				<ButtonGroup className={ "w-100" }>
					<IconButton
						IsLoading={ IsSending }
						className={ "flat" }
						onClick={ SaveConfig }
						variant={ "success" }
					>
						<FontAwesomeIcon icon={ "save" }/> Speichern{ " " }
					</IconButton>
				</ButtonGroup>
				{ JsonError !== "" && (
					<Alert
						variant="danger"
						onClose={ () => setJsonError( "" ) }
						dismissible
						className={ "rounded-0 m-0" }
					>
						<FontAwesomeIcon
							icon={ "exclamation-triangle" }
							className={ "icon" }
							size={ "xl" }
						/>{ " " }
						Wurde nicht gespeichert. Error wurde erkannt...
						<hr/> <b>{ JsonError }</b>
					</Alert>
				) }
			</Card.Header>
			<>
				<Card.Body className={ "text-light p-0" } style={ { height: 750 } }>
					<CodeMirror
						height={ "750px" }
						theme={ gruvboxDarkInit( {
							settings: {
								...defaultSettingsGruvboxDark
							}
						} ) }
						className={ "h-100" }
						value={ content }
						extensions={ [ json() ] }
						onChange={ ( value ) => codeMirrorRef.current = value }
					/>
				</Card.Body>
			</>
		</Card>
	);
};

export { Component };

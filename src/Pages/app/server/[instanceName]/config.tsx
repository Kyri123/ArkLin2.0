import {
	apiAuth,
	apiHandleError,
	successSwal
} from "@app/Lib/tRPC";
import { json } from "@codemirror/lang-json";
import { IconButton } from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useArkServerConfigs } from "@hooks/useArkServerConfigs";
import { defaultSettingsGruvboxDark, gruvboxDarkInit } from "@uiw/codemirror-theme-gruvbox-dark";
import CodeMirror from "@uiw/react-codemirror";
import {
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";
import {
	Alert,
	ButtonGroup,
	Card
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import type { SingleValue } from "react-select";
import Select from "react-select";


const Component = () => {
	const { instanceName } = useParams();
	const {
		requestConfigContent,
		configFiles,
		configContent,
		currentFile
	} = useArkServerConfigs( instanceName! );
	const [ content, setContent ] = useState( "" );
	const [ jsonError, setJsonError ] = useState( "" );
	const [ isSending, setIsSending ] = useState( false );
	const codeMirrorRef = useRef<string>( "" );

	useEffect( () => {
		if( configContent ) {
			setContent( configContent );
			codeMirrorRef.current = configContent;
		}
	}, [ configContent ] );

	useEffect( () => {
		if( Object.keys( configFiles ).length > 0 ) {
			requestConfigContent( Object.values( configFiles )[ 0 ] );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ configFiles ] );

	const getOptions = useMemo( () => {
		const result: { value: string, label: string }[] = [];
		for( const [ label, value ] of Object.entries( configFiles ) ) {
			result.push( { value, label } );
		}
		return result;
	}, [ configFiles ] );

	const setOption = (
		NewValue: SingleValue<{ value: string, label: string }>
	) => {
		if( NewValue ) {
			requestConfigContent( NewValue.value );
		}
	};

	const saveConfig = async() => {
		setIsSending( true );

		await apiAuth.server.config.updateConfigClearText.mutate( {
			instanceName: instanceName!,
			content: codeMirrorRef.current,
			file: currentFile
		} ).then( successSwal ).catch( apiHandleError );

		setIsSending( false );
	};

	return (
		<Card>
			<Card.Header className="p-0">
				<div className="d-flex bd-highlight w-100">
					<div className="p-0 flex-grow-1 bd-highlight">
						<h3 className="card-title p-3">Server Konfiguration</h3>
					</div>
					<div className="p-2 flex-grow-1 bd-highlight">
						<Select className="w-100"
							options={ getOptions }
							value={ {
								value: currentFile || "",
								label: currentFile.split( "/" ).pop() || ""
							} }
							onChange={ E => {
								setOption( E );
							} } />
					</div>
				</div>
			</Card.Header>
			<Card.Header className="p-0">
				<ButtonGroup className="w-100">
					<IconButton IsLoading={ isSending }
						className="flat"
						onClick={ saveConfig }
						variant="success">
						<FontAwesomeIcon icon="save" /> Speichern{ " " }
					</IconButton>
				</ButtonGroup>
				{ jsonError !== "" && (
					<Alert variant="danger"
						onClose={ () => setJsonError( "" ) }
						dismissible
						className="rounded-0 m-0">
						<FontAwesomeIcon icon="exclamation-triangle"
							className="icon"
							size="xl" />{ " " }
						Wurde nicht gespeichert. Error wurde erkannt...
						<hr /> <b>{ jsonError }</b>
					</Alert>
				) }
			</Card.Header>
			<>
				<Card.Body className="text-light p-0" style={ { height: 750 } }>
					<CodeMirror height="750px"
						theme={ gruvboxDarkInit( {
							settings: {
								...defaultSettingsGruvboxDark
							}
						} ) }
						className="h-100"
						value={ content }
						extensions={ [ json() ] }
						onChange={ value => codeMirrorRef.current = value } />
				</Card.Body>
			</>
		</Card>
	);
};

export { Component };


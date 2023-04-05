import { IServerCardProps }    from "../../../../Types/Server";
import { Card }                from "react-bootstrap";
import CFormatLog              from "../../../../Components/Elements/Server/CFormatLog";
import Select, { SingleValue } from "react-select";
import { useArkServerLogs }    from "../../../../Hooks/useArkServerLogs";

export default function SPServerLogs( Props : IServerCardProps ) {
	const { LogFiles, LogContent, RequestLogContent, CurrentFile } =
		useArkServerLogs( Props.InstanceName );

	const GetOptions = () => {
		const Return : { value : string; label : string }[] = [];
		for ( const [ FilePath, File ] of Object.entries( LogFiles ) ) {
			Return.push( {
				value: File,
				label: FilePath
			} );
		}
		return Return;
	};

	const SetOption = (
		NewValue : SingleValue<{ value : string; label : string }>
	) => {
		if ( NewValue ) {
			RequestLogContent( NewValue.value );
		}
	};

	return (
		<Card>
			<Card.Header className={ "p-0" }>
				<div className="d-flex bd-highlight w-100">
					<div className="p-0 flex-grow-1 bd-highlight">
						<h3 className="card-title p-3">Server Logs</h3>
					</div>
					<div className="p-2 flex-grow-1 bd-highlight">
						<Select
							className={ "w-100" }
							options={ GetOptions() }
							value={ {
								value: CurrentFile || "",
								label: CurrentFile.split( "/" ).pop() || ""
							} }
							onChange={ SetOption }
						/>
					</div>
				</div>
			</Card.Header>
			<Card.Body
				className={ "bg-dark text-light p-0" }
				style={ { overflowX: "hidden", overflowY: "scroll", maxHeight: 750 } }
			>
				<CFormatLog LogContent={ LogContent } />
			</Card.Body>
		</Card>
	);
}

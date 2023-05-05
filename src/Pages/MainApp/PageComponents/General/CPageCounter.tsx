import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import {
	useEffect,
	useMemo,
	useState
}                                 from "react";
import { ButtonGroup }            from "react-bootstrap";
import type { IPageCounterProps } from "@app/Types/PageAddons";
import { IconButton }             from "@comp/Elements/AdminLTE/Buttons";

export default function CPageCounter<T>( Props : IPageCounterProps<T> ) {
	const [ Page, setPage ] = useState( 0 );
	const PageGroups = useMemo<T[][]>( () => {
		const PerPage = Math.max( 1, Props.PerPage || 10 );
		const Copy : T[] = structuredClone( Props.Data );
		const Groups : T[][] = [];
		while ( Copy.length > 0 ) {
			Groups.push( Copy.splice( 0, PerPage ) );
		}
		if ( !Groups[ Page ] ) {
			setPage( 0 );
		}

		return Groups;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ Props.Data ] );

	useEffect( () => {
		Props.OnSetPage( PageGroups[ Page ] || [] );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ Page, PageGroups ] );

	if ( PageGroups.length <= 1 ) {
		return <></>;
	}

	return (
		<ButtonGroup>
			<IconButton
				onClick={ () => setPage( 0 ) }
				IsLoading={ false }
				disabled={ Page <= 0 }
			>
				<FontAwesomeIcon icon={ "angle-double-left" }/>
			</IconButton>
			<IconButton
				onClick={ () => setPage( Page - 1 ) }
				IsLoading={ false }
				disabled={ PageGroups[ Page - 1 ] === undefined }
			>
				<FontAwesomeIcon icon={ "angle-left" }/>
			</IconButton>
			<IconButton
				IsLoading={ false }
				Hide={ PageGroups[ Page - 3 ] === undefined }
				disabled={ true }
			>
				...
			</IconButton>
			<IconButton
				className="d-sm-none d-md-block"
				onClick={ () => setPage( Page - 2 ) }
				IsLoading={ false }
				Hide={ PageGroups[ Page - 2 ] === undefined }
			>
				{ Page - 2 }
			</IconButton>
			<IconButton
				onClick={ () => setPage( Page - 1 ) }
				IsLoading={ false }
				Hide={ PageGroups[ Page - 1 ] === undefined }
			>
				{ Page - 1 }
			</IconButton>
			<IconButton IsLoading={ false } disabled={ true }>
				{ Page }
			</IconButton>
			<IconButton
				onClick={ () => setPage( Page + 1 ) }
				IsLoading={ false }
				Hide={ PageGroups[ Page + 1 ] === undefined }
			>
				{ Page + 1 }
			</IconButton>
			<IconButton
				className="d-sm-none d-md-block"
				onClick={ () => setPage( Page + 2 ) }
				IsLoading={ false }
				Hide={ PageGroups[ Page + 2 ] === undefined }
			>
				{ Page + 2 }
			</IconButton>
			<IconButton
				IsLoading={ false }
				Hide={ PageGroups[ Page + 3 ] === undefined }
				disabled={ true }
			>
				...
			</IconButton>
			<IconButton
				onClick={ () => setPage( Page + 1 ) }
				IsLoading={ false }
				disabled={ PageGroups[ Page + 1 ] === undefined }
			>
				<FontAwesomeIcon icon={ "angle-right" }/>
			</IconButton>
			<IconButton
				onClick={ () => setPage( PageGroups.length - 1 ) }
				IsLoading={ false }
				disabled={ Page === PageGroups.length - 1 }
			>
				<FontAwesomeIcon icon={ "angle-double-right" }/>
			</IconButton>
		</ButtonGroup>
	);
}

import {
	useCallback,
	useEffect,
	useMemo,
	useState
} from "react";

export interface QueryRange {
	skip : number,
	limit : number
}

export function useRawPageHandler<T extends Array<T>>( length : number, onPageUpdated : ( options : QueryRange ) => Promise<void>, show = 10 ) {
	const [ page, updatePage ] = useState( 0 );

	const maxPage = useMemo( () => Math.ceil( length / show ), [ length, show ] );
	const filterOption = useMemo( () => ( { skip: page * show, limit: show } ), [ page, show ] );
	const refresh = () => onPageUpdated( filterOption );

	const setPage = useCallback( async( page : number ) => {
		updatePage( () => page );
		await onPageUpdated( { skip: page * show, limit: show } );
	}, [ onPageUpdated, show ] );

	useEffect( () => {
		if ( page > maxPage ) {
			setPage( maxPage ).then( () => {
			} );
		}
	}, [ page, maxPage, setPage, onPageUpdated, show ] );

	return { filterOption, refresh, setPage, currentPage: page, maxPage };
}
import type { FunctionComponent } from "react";
import { useEffect } from "react";
import type { ButtonProps } from "react-bootstrap";
import {
	Button,
	ButtonGroup
} from "react-bootstrap";
import type { ButtonGroupProps } from "react-bootstrap/ButtonGroup";
import {
	FaAngleDoubleLeft,
	FaAngleDoubleRight,
	FaAngleLeft,
	FaAngleRight
} from "react-icons/all";


interface IPageManagerProps {
	MaxPage: number,
	onPageChange: ( Page: number ) => void,
	Page: number,
	ButtonProps?: ButtonProps,
	ButtonGroupProps?: ButtonGroupProps
}

const PageManager: FunctionComponent<IPageManagerProps> = ( {
	ButtonGroupProps,
	ButtonProps,
	MaxPage,
	Page,
	onPageChange
} ) => {
	useEffect( () => {
		if( Page > MaxPage || Page < 0 ) {
			onPageChange( Math.clamp( 0, Page, MaxPage - 1 ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ MaxPage, Page ] );

	if( MaxPage <= 1 ) {
		return null;
	}

	return (
		<ButtonGroup { ...ButtonGroupProps }>
			<Button { ...ButtonProps } onClick={ () => onPageChange( 0 ) }
			        disabled={ Page === 0 }><FaAngleDoubleLeft /></Button>
			<Button { ...ButtonProps } onClick={ () => onPageChange( Page - 1 ) }
			        disabled={ Page - 1 < 0 }><FaAngleLeft /></Button>
			<Button { ...ButtonProps } disabled={ true }>{ Page + 1 }</Button>
			<Button { ...ButtonProps } onClick={ () => onPageChange( Page + 1 ) }
			        disabled={ Page + 1 >= MaxPage }><FaAngleRight /></Button>
			<Button { ...ButtonProps } onClick={ () => onPageChange( MaxPage - 1 ) }
			        disabled={ Page === MaxPage - 1 }><FaAngleDoubleRight /></Button>
		</ButtonGroup>
	);
};

export default PageManager;

import type { LoaderFunction } from "react-router-dom";
import { json }                from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MeLoaderProps {
}

const loader : LoaderFunction = async() => {
	return json<MeLoaderProps>( {} );
};

export { loader };
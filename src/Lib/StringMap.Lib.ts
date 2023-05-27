import Config from "@shared/StringMap/Config.json";
import Navigation from "@shared/StringMap/Navigation.json";


export default class StringMapLib {
	static nav( Location: string ): string {
		return (
			( Navigation.MainPage as Record<string, string> )[ Location ] ||
			this.subNav( Location )
		);
	}

	static subNav( Location: string ): string {
		return ( Navigation.Subpage as Record<string, string> )[ Location ] || Location;
	}

	static config( Key: string ): string {
		return ( Config as Record<string, string> )[ Key ] || Key;
	}

}

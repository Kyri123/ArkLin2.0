import Navigation from "../Shared/StringMap/Navigation.json"
import Config     from "../Shared/StringMap/Config.json"

export default class StringMapLib {
	static Nav( Location : string ) : string {
		return ( Navigation.MainPage as Record<string, string> )[ Location ] || this.SubNav( Location );
	}

	static SubNav( Location : string ) : string {
		return ( Navigation.Subpage as Record<string, string> )[ Location ] || Location;
	}

	static Config( Key : string ) : string {
		return ( Config as Record<string, string> )[ Key ] || Key;
	}
}
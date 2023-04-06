export interface IISLoggedInRequest {
	LoginHash? : string;
}

export interface ISignInRequest {
	login? : string;
	password? : string;
	stayloggedin? : boolean;
}

export interface ISignUpRequest {
	user? : string;
	email? : string;
	password? : string;
	passwordagain? : string;
	accountkey? : string;
}

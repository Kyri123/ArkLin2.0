import { IAPIResponseBase } from "../Type/API_Response";

export const DefaultResponseSuccess : IAPIResponseBase<false> = {
	Auth: false,
	Data: undefined,
	Message: {
		AlertType: "success",
		Message: "Erfolgreich!",
		Title: "Aktion wurde erfolgreich abgeschlossen!"
	},
	Success: true
};

export const DefaultResponseFailed : IAPIResponseBase<false> = {
	Auth: false,
	Data: undefined,
	Message: {
		AlertType: "danger",
		Message: `Fehler beim verarbeiten der Daten.`,
		Title: "Fehler!"
	},
	Success: false
};
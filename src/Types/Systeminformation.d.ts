export interface SystemUsage {
	CPU : number;
	MemMax : number;
	MemUsed : number;
	DiskMax : number;
	DiskUsed : number;
	PanelNeedUpdate : boolean;
	UpdateIsRunning : boolean;
	PanelVersionName : string;
	PanelBuildVersion : string;
	NextPanelBuildVersion : string;
}

export interface ISelectMask {
	Value : string;
	Text : string;
	PreAndSuffix : "'" | "\"" | "";
	HasValue? : boolean;
}

import Arkmanager_Command_Checkmodupdate from "@shared/SelectMask/Arkmanager_Command_Checkmodupdate.json";
import Arkmanager_Command_Restart        from "@shared/SelectMask/Arkmanager_Command_Restart.json";
import Arkmanager_Command_Stop           from "@shared/SelectMask/Arkmanager_Command_Stop.json";
import Arkmanager_Command_Update         from "@shared/SelectMask/Arkmanager_Command_Update.json";
import Arkmanager_Command_Start          from "@shared/SelectMask/Arkmanager_Command_Start.json";
import type { ISelectMask }                   from "@app/Types/Systeminformation";

export enum EArkmanagerCommands {
	start = "start",
	stop = "stop",
	restart = "restart",
	install = "install",
	update = "update",
	cancelshutdown = "cancelshutdown",
	checkupdate = "checkupdate",
	checkmodupdate = "checkmodupdate",
	installmods = "installmods",
	uninstallmods = "uninstallmods",
	listMods = "list-mods",
	backup = "backup",
	saveworld = "saveworld",
	status = "status",
	printconfig = "printconfig",
	getpid = "getpid",
}

export function GetMaskFromCommand(
	Command : EArkmanagerCommands
) : ISelectMask[] {
	switch ( Command ) {
		case EArkmanagerCommands.start:
			return Arkmanager_Command_Start as ISelectMask[];
		case EArkmanagerCommands.stop:
			return Arkmanager_Command_Stop as ISelectMask[];
		case EArkmanagerCommands.restart:
			return Arkmanager_Command_Restart as ISelectMask[];
		case EArkmanagerCommands.install:
			break;
		case EArkmanagerCommands.update:
			return Arkmanager_Command_Update as ISelectMask[];
		case EArkmanagerCommands.cancelshutdown:
			break;
		case EArkmanagerCommands.checkupdate:
			break;
		case EArkmanagerCommands.checkmodupdate:
			return Arkmanager_Command_Checkmodupdate as ISelectMask[];
		case EArkmanagerCommands.installmods:
			break;
		case EArkmanagerCommands.uninstallmods:
			break;
		case EArkmanagerCommands.listMods:
			break;
		case EArkmanagerCommands.backup:
			break;
		case EArkmanagerCommands.saveworld:
			break;
		case EArkmanagerCommands.status:
			break;
		case EArkmanagerCommands.printconfig:
			break;
		case EArkmanagerCommands.getpid:
			break;
	}
	return [];
}

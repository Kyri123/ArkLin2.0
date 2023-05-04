import fs     from "fs";
import path   from "path";
import { BC } from "@server/Lib/System.Lib";

export type TTasksRunner = "ServerState" | "Systeminformation" | "DataCleaner" | "Github" | "SteamAPI" | "Server";

export class JobTask {
	public JobName = "";
	protected Interval = 60000;
	protected Task : NodeJS.Timer;
	protected TaskFunction : ( CallCount : number ) => Promise<void>;
	protected TickCount = 1;
	protected IsRun = false;
	protected RunNextTask = [ false, false ];

	constructor(
		Interval : number,
		JobName : TTasksRunner,
		Task : ( CallCount : number ) => Promise<void>
	) {
		this.JobName = JobName;
		this.Interval = Interval;
		this.TaskFunction = Task;
		this.Task = setInterval( this.Tick.bind( this ), this.Interval );
		this.Tick().then( () =>
			SystemLib.Log( "tasks", `Init run job:`, SystemLib.ToBashColor( "Red" ), this.JobName )
		);
	}

	public UpdateTickTime( NewTime : number ) {
		clearInterval( this.Task );
		this.Task = setInterval( this.Tick.bind( this ), NewTime );
	}

	public DestroyTask() {
		clearInterval( this.Task );
	}

	public async ForceTask( ResetTime = false ) {
		if ( this.IsRun ) {
			this.RunNextTask = [ true, ResetTime ];
		}

		await this.Tick();
		if ( ResetTime ) {
			this.DestroyTask();
			this.Task = setInterval( this.Tick.bind( this ), this.Interval );
		}
	}

	protected async Tick() {
		this.IsRun = true;
		await this.TaskFunction( this.TickCount );
		this.IsRun = false;
		this.TickCount++;
		if ( this.TickCount >= 1000 ) {
			this.TickCount = 1;
		}

		if ( this.RunNextTask[ 0 ] ) {
			if ( this.RunNextTask[ 1 ] ) {
				this.DestroyTask();
				this.Task = setInterval( this.Tick.bind( this ), this.Interval );
			}
			this.RunNextTask = [ false, false ];
			await this.Tick();
		}
	}
}

export class JobTaskCycle<T> extends JobTask {
	protected GetArrayFunction : ( Self : JobTaskCycle<T> ) => Promise<T[]>;
	protected TaskFunction : ( CallCount : number, Object? : T ) => Promise<void>;
	private CurrentIndex = 0;
	private MaxIndex = -1;
	private Array : T[] = [];

	protected async Tick() : Promise<void> {
		try {
			if ( !this.IsRun ) {
				this.IsRun = true;
				if ( this.CurrentIndex >= this.MaxIndex ) {
					this.Array = await this.GetArrayFunction( this );
					this.MaxIndex = this.Array.length;
					this.CurrentIndex = 0;
				}

				await this.TaskFunction( this.CurrentIndex, this.Array[ this.CurrentIndex ] );
				this.CurrentIndex++;
				this.IsRun = false;
			}
		}
		catch ( e ) {
			this.IsRun = false;
		}
	}

	public async ForceTask( ResetTime ) : Promise<void> {
		if ( ResetTime ) {
			this.MaxIndex = ( await this.GetArrayFunction( this ) ).length;
		}

		this.Array = await this.GetArrayFunction( this );
		for ( let i = 0; i < this.Array.length; i++ ) {
			await this.TaskFunction( i, this.Array[ i ] );
		}
	}

	constructor(
		JobName : TTasksRunner,
		GetArrayFunction : ( Self : JobTaskCycle<T> ) => Promise<T[]>,
		Task : ( CallCount : number, Object? : T ) => Promise<void>
	) {
		super( 1000, JobName, Task );
		this.GetArrayFunction = GetArrayFunction;
		this.JobName = JobName;
		this.TaskFunction = Task;
		this.Tick().then( () =>
			SystemLib.Log( "tasks", `Init run job:`, BC( "Red" ), this.JobName )
		);
	}
}

export class TaskManagerClass {
	public Jobs : Record<string, JobTask> = {};

	async Init() {
		for ( const File of fs.readdirSync(
			path.join( __basedir, "server/src/Tasks/Jobs" )
		) ) {
			const Stats = fs.statSync(
				path.join( __basedir, "server/src/Tasks/Jobs", File )
			);
			if ( Stats.isFile() && File.endsWith( ".Job.ts" ) ) {
				const JobClass : JobTask = (
					await import(path.join( __basedir, "server/src/Tasks/Jobs", File ))
				).default as JobTask;
				this.Jobs[ JobClass.JobName ] = JobClass;
			}
		}
	}

	RunTask( Task : TTasksRunner, ResetTimer = false ) {
		if ( this.Jobs[ Task ] ) {
			this.Jobs[ Task ].ForceTask( ResetTimer );
		}
	}
}

let TaskManager = global.TManager;

if ( !global.TManager ) {
	global.TManager = new TaskManagerClass();
	TaskManager = global.TManager;
}

export default TaskManager;

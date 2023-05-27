import { BC } from "@/server/src/Lib/system.Lib";
import fs from "fs";
import path from "path";


export type TTasksRunner = "ServerState" | "Systeminformation" | "DataCleaner" | "Github" | "SteamAPI" | "Server";

export class JobTask {
	public JobName = "";
	protected Interval = 60000;
	protected Task: NodeJS.Timer;
	protected taskFunction: ( CallCount: number ) => Promise<void>;
	protected tickCount = 1;
	protected IsRun = false;
	protected RunNextTask = [ false, false ];

	constructor(
		Interval: number,
		JobName: TTasksRunner,
		Task: ( CallCount: number ) => Promise<void>
	) {
		this.JobName = JobName;
		this.Interval = Interval;
		this.taskFunction = Task;
		this.Task = setInterval( this.tick.bind( this ), this.Interval );
		this.tick().then( () =>
			SystemLib.log( "tasks", `init run job:`, SystemLib.toBashColor( "Red" ), this.JobName )
		);
	}

	public updateTickTime( NewTime: number ) {
		clearInterval( this.Task );
		this.Task = setInterval( this.tick.bind( this ), NewTime );
	}

	public destroyTask() {
		clearInterval( this.Task );
	}

	public async forceTask( ResetTime = false ) {
		if( this.IsRun ) {
			this.RunNextTask = [ true, ResetTime ];
		}

		await this.tick();
		if( ResetTime ) {
			this.destroyTask();
			this.Task = setInterval( this.tick.bind( this ), this.Interval );
		}
	}

	protected async tick() {
		this.IsRun = true;
		await this.taskFunction( this.tickCount );
		this.IsRun = false;
		this.tickCount++;
		if( this.tickCount >= 1000 ) {
			this.tickCount = 1;
		}

		if( this.RunNextTask[ 0 ] ) {
			if( this.RunNextTask[ 1 ] ) {
				this.destroyTask();
				this.Task = setInterval( this.tick.bind( this ), this.Interval );
			}
			this.RunNextTask = [ false, false ];
			await this.tick();
		}
	}
}

export class JobTaskCycle<T> extends JobTask {
	protected getArrayFunction: ( Self: JobTaskCycle<T> ) => Promise<T[]>;
	protected taskFunction: ( CallCount: number, Object?: T ) => Promise<void>;
	private CurrentIndex = 0;
	private MaxIndex = -1;
	private Array: T[] = [];

	protected async tick(): Promise<void> {
		try {
			if( !this.IsRun ) {
				this.IsRun = true;
				if( this.CurrentIndex >= this.MaxIndex ) {
					this.Array = await this.getArrayFunction( this );
					this.MaxIndex = this.Array.length;
					this.CurrentIndex = 0;
				}

				await this.taskFunction( this.CurrentIndex, this.Array[ this.CurrentIndex ] );
				this.CurrentIndex++;
				this.IsRun = false;
			}
		} catch( e ) {
			this.IsRun = false;
		}
	}

	public async forceTask( ResetTime ): Promise<void> {
		if( ResetTime ) {
			this.MaxIndex = ( await this.getArrayFunction( this ) ).length;
		}

		this.Array = await this.getArrayFunction( this );
		for( let i = 0; i < this.Array.length; i++ ) {
			await this.taskFunction( i, this.Array[ i ] );
		}
	}

	constructor(
		JobName: TTasksRunner,
		getArrayFunction: ( Self: JobTaskCycle<T> ) => Promise<T[]>,
		Task: ( CallCount: number, Object?: T ) => Promise<void>
	) {
		super( 1000, JobName, Task );
		this.getArrayFunction = getArrayFunction;
		this.JobName = JobName;
		this.taskFunction = Task;
		this.tick().then( () =>
			SystemLib.log( "tasks", `init run job:`, BC( "Red" ), this.JobName )
		);
	}
}

export class TaskManagerClass {
	public Jobs: Record<string, JobTask> = {};

	async init() {
		for( const file of fs.readdirSync(
			path.join( BASEDIR, "server/src/Tasks/Jobs" )
		) ) {
			const stats = fs.statSync(
				path.join( BASEDIR, "server/src/Tasks/Jobs", file )
			);
			if( stats.isFile() && file.endsWith( ".Job.ts" ) ) {
				const jobClass: JobTask = (
					await import( path.join( BASEDIR, "server/src/Tasks/Jobs", file ) )
				).default as JobTask;
				this.Jobs[ jobClass.JobName ] = jobClass;
			}
		}
	}

	async runTask( Task: TTasksRunner, ResetTimer = false ) {
		if( this.Jobs[ Task ] ) {
			await this.Jobs[ Task ].forceTask( ResetTimer );
		}
	}
}

let taskManager = global.TManager;

if( !global.TManager ) {
	global.TManager = new TaskManagerClass();
	taskManager = global.TManager;
}

export default taskManager;

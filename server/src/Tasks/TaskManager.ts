import fs from "fs";
import path from "path";

export class JobTask {
  public JobName = "";
  protected Interval = 60000;
  protected Task: NodeJS.Timer;
  protected TaskFunction: (CallCount: number) => void;
  private TickCount = 1;
  private IsRun = false;
  private RunNextTask = [false, false];

  constructor(
    Interval: number,
    JobName: string,
    Task: (CallCount: number) => void
  ) {
    this.JobName = JobName;
    this.Interval = Interval;
    this.TaskFunction = Task;
    this.Task = setInterval(this.Tick.bind(this), this.Interval);
    this.Tick().then(() =>
      SystemLib.Log(`Init run job:`, SystemLib.ToBashColor("Red"), this.JobName)
    );
  }

  public DestroyTask() {
    clearInterval(this.Task);
  }

  public async ForceTask(ResetTime = false) {
    if (this.IsRun) {
      this.RunNextTask = [true, ResetTime];
    }

    await this.Tick();
    if (ResetTime) {
      this.DestroyTask();
      this.Task = setInterval(this.Tick.bind(this), this.Interval);
    }
  }

  private async Tick() {
    this.IsRun = true;
    await this.TaskFunction(this.TickCount);
    this.IsRun = false;
    this.TickCount++;
    if (this.TickCount >= 1000) {
      this.TickCount = 1;
    }

    if (this.RunNextTask[0]) {
      if (this.RunNextTask[1]) {
        this.DestroyTask();
        this.Task = setInterval(this.Tick.bind(this), this.Interval);
      }
      this.RunNextTask = [false, false];
      await this.Tick();
    }
  }
}

export type TTasksRunner = "ServerState" | "Systeminformation" | "DataCleaner";

export class TaskManagerClass {
  public Jobs: Record<string, JobTask> = {};

  async Init() {
    for (const File of fs.readdirSync(
      path.join(__basedir, "server/src/Tasks/Jobs")
    )) {
      const Stats = fs.statSync(
        path.join(__basedir, "server/src/Tasks/Jobs", File)
      );
      if (Stats.isFile() && File.endsWith(".Job.ts")) {
        const JobClass: JobTask = (
          await import(path.join(__basedir, "server/src/Tasks/Jobs", File))
        ).default as JobTask;
        this.Jobs[JobClass.JobName] = JobClass;
      }
    }
  }

  RunTask(Task: TTasksRunner, ResetTimer = false) {
    if (this.Jobs[Task]) {
      this.Jobs[Task].ForceTask(ResetTimer);
    }
  }
}

let TaskManager = global.TManager;

if (!global.TManager) {
  global.TManager = new TaskManagerClass();
  TaskManager = global.TManager;
}

export default TaskManager;

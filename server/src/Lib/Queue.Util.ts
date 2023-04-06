import { InstallAllTE } from "../TypeExtension/TE_InstallAll";
import "../Types/global";

export default class Queue<T> {
	private Queue : T[];
	private IsUniqueQueue : boolean;

	constructor( IsUniqueQueue = false, DefaultQueueArray : T[] = [] ) {
		InstallAllTE();
		this.Queue = DefaultQueueArray;
		this.IsUniqueQueue = IsUniqueQueue;
	}

	public Enqeue( Content : T ) : void {
		if ( this.IsUniqueQueue ) {
			if ( !this.IsInQueue( Content ) ) {
				this.Queue.push( Content );
			}
			return;
		}
		this.Queue.push( Content );
	}

	public Enqeue_Array( Content : T[] ) : void {
		this.Queue = this.Queue.concat( Content );
	}

	public Deqeue() : T | false {
		if ( this.HasElements() ) {
			const Content : T = this.Queue[ 0 ];
			this.Queue.RemoveByIndex( 0 );
			return Content;
		}
		return false;
	}

	public DeqeueCount( Count : number ) : T[] | false {
		const DequeueElements : T[] = [];
		if ( this.HasElements() ) {
			for ( let Idx = 0; Math.min( this.Length(), Count ); ++Idx ) {
				DequeueElements.push( this.Deqeue() as T );
			}
			return DequeueElements;
		}
		return false;
	}

	HasElements() : boolean {
		return !this.Queue.IsEmpty();
	}

	Length() : number {
		return this.Queue.length;
	}

	GetPositionInQueue( Element : T ) : number {
		return this.Queue.FindIndexOf( Element );
	}

	IsNextInQueue( Element : T ) : boolean {
		return this.Queue.FindIndexOf( Element ) === 0;
	}

	IsInQueue( Element : T ) : boolean {
		return this.Queue.Contains( Element );
	}
}

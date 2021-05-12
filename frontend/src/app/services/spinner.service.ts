import {Injectable} from "@angular/core"
import {BehaviorSubject} from "rxjs"

@Injectable({
	providedIn: "root",
})
export class SpinnerService {
	private is_loading$$ = new BehaviorSubject<boolean>(false)
	is_loading$ = this.is_loading$$.asObservable()

	constructor() {}

	set_spinning(set: boolean) {
		Promise.resolve(null).then(() => {
			this.is_loading$$.next(set)
		})
	}
}

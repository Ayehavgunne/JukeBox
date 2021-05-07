import {Injectable} from "@angular/core"
import {UAParser} from "ua-parser-js"

@Injectable({
	providedIn: "root",
})
export class UaService {
	ua_parser = new UAParser(navigator.userAgent)

	constructor() {}
}

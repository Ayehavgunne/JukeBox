import {UAParser} from "ua-parser-js"

export let print = (...args: any[]) => {
	console.log(...args)
}

export let ua_parser = new UAParser(navigator.userAgent)

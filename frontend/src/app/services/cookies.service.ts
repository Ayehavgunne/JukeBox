import {Injectable} from "@angular/core"
import {print} from "../utils"

@Injectable({
	providedIn: "root",
})
export class CookiesService {
	constructor() {}

	public delete(name: string) {
		this.set(name, "", -1)
	}

	public get(name: string) {
		const cookies: Array<string> = decodeURIComponent(document.cookie).split(";")
		const cookieName = `${name}=`
		let cookie: string

		for (let i = 0; i < cookies.length; i += 1) {
			cookie = cookies[i].replace(/^\s+/g, "")
			if (cookie.indexOf(cookieName) === 0) {
				return cookie.substring(cookieName.length, cookie.length)
			}
		}
		return ""
	}

	public set(name: string, value: string, expire_days: number = 7) {
		const date: Date = new Date()
		date.setTime(date.getTime() + expire_days * 24 * 60 * 60 * 1000)
		const expires = `expires=${date.toUTCString()}`
		document.cookie = `${name}=${value}; ${expires}; SameSite=Strict`
	}
}

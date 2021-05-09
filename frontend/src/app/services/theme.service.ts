import {Inject, Injectable, EventEmitter} from "@angular/core"
import {ACTIVE_THEME, Theme, THEMES} from "../models"

@Injectable({
	providedIn: "root",
})
export class ThemeService {
	themeChange = new EventEmitter<Theme>()

	constructor(
		@Inject(THEMES) public themes: Theme[],
		@Inject(ACTIVE_THEME) public theme: string,
	) {}

	get_theme(name: string) {
		const theme = this.themes.find(t => t.name === name)
		if (!theme) {
			throw new Error(`Theme not found: '${name}'`)
		}
		return theme
	}

	get_active_theme() {
		return this.get_theme(this.theme)
	}

	get_property(propName: string) {
		return this.get_active_theme().properties[propName]
	}

	set_theme(name: string) {
		this.theme = name
		this.themeChange.emit(this.get_active_theme())
	}

	register_theme(theme: Theme) {
		this.themes.push(theme)
	}

	update_theme(name: string, properties: {[key: string]: string}) {
		const theme = this.get_theme(name)
		theme.properties = {
			...theme.properties,
			...properties,
		}

		if (name === this.theme) {
			this.themeChange.emit(theme)
		}
	}
}

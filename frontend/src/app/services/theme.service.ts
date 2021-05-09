import {Inject, Injectable, EventEmitter} from "@angular/core"
import {ACTIVE_THEME, Theme, THEMES} from "../models"
import {UserService} from "./user.service"

@Injectable({
	providedIn: "root",
})
export class ThemeService {
	theme_change = new EventEmitter<Theme>()

	constructor(
		@Inject(THEMES) public themes: Theme[],
		@Inject(ACTIVE_THEME) public theme: string,
		private user_service: UserService,
	) {}

	get_theme(name: string): Theme {
		const theme = this.themes.find(t => t.name === name)
		if (!theme) {
			throw new Error(`Theme not found: '${name}'`)
		}
		return theme
	}

	get_active_theme(): Theme {
		return this.get_theme(this.theme)
	}

	get_property(prop_name: string): string {
		return this.get_active_theme().properties[prop_name]
	}

	set_property(prop_name: string, value: string): void {
		this.get_active_theme().properties[prop_name] = value
		this.theme_change.emit(this.get_active_theme())
	}

	set_theme(name: string): void {
		this.theme = name
		this.user_service.current_user.settings.theme_name = name
		this.user_service.update_user_settings(this.user_service.current_user)
		this.theme_change.emit(this.get_active_theme())
	}

	register_theme(theme: Theme): void {
		this.themes.push(theme)
	}

	update_theme(name: string, properties: {[key: string]: string}): void {
		const theme = this.get_theme(name)
		theme.properties = {
			...theme.properties,
			...properties,
		}

		if (name === this.theme) {
			this.theme_change.emit(theme)
		}
	}
}

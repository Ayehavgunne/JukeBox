import {ModuleWithProviders, NgModule} from "@angular/core"
import {CommonModule} from "@angular/common"
import {ThemeService} from "../services/theme.service"
import {ThemeDirective} from "../directives/theme.directive"
import {ACTIVE_THEME, ThemeOptions, THEMES} from "../models"

@NgModule({
	imports: [CommonModule],
	providers: [ThemeService],
	declarations: [ThemeDirective],
	exports: [ThemeDirective],
})
export class ThemeModule {
	static forRoot(options: ThemeOptions): ModuleWithProviders<ThemeModule> {
		return {
			ngModule: ThemeModule,
			providers: [
				{
					provide: THEMES,
					useValue: options.themes,
				},
				{
					provide: ACTIVE_THEME,
					useValue: options.active,
				},
			],
		}
	}
}

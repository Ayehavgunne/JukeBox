import {Directive, ElementRef} from "@angular/core"
import {Subject} from "rxjs"
import {ThemeService} from "../services/theme.service"
import {takeUntil} from "rxjs/operators"
import {Theme} from "../models"

@Directive({
	selector: "[theme]",
})
export class ThemeDirective {
	private _destroy$ = new Subject()

	constructor(private _elementRef: ElementRef, private _themeService: ThemeService) {}

	ngOnInit() {
		const active = this._themeService.get_active_theme()
		if (active) {
			this.update_theme(active)
		}

		this._themeService.themeChange
			.pipe(takeUntil(this._destroy$))
			.subscribe((theme: Theme) => this.update_theme(theme))
	}

	ngOnDestroy() {
		this._destroy$.next()
		this._destroy$.complete()
	}

	update_theme(theme: Theme) {
		for (const key in theme.properties) {
			if (theme.properties.hasOwnProperty(key)) {
				this._elementRef.nativeElement.style.setProperty(
					key,
					theme.properties[key],
				)
			}
		}
		for (const name of this._themeService.theme) {
			this._elementRef.nativeElement.classList.remove(`${name}-theme`)
		}
		this._elementRef.nativeElement.classList.add(`${theme.name}-theme`)
	}
}

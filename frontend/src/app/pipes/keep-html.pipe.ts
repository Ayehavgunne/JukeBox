import {Pipe, PipeTransform} from "@angular/core"
import {DomSanitizer} from "@angular/platform-browser"

@Pipe({
	name: "keepHtml",
	pure: false,
})
export class KeepHtmlPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}
	transform(value: string) {
		return this.sanitizer.bypassSecurityTrustHtml(value)
	}
}

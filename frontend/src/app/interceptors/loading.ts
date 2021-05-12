import {Injectable} from "@angular/core"
import {HttpRequest, HttpHandler, HttpInterceptor} from "@angular/common/http"
import {finalize} from "rxjs/operators"
import {SpinnerService} from "../services/spinner.service"

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
	private totalRequests = 0

	constructor(private spinner_service: SpinnerService) {}

	intercept(request: HttpRequest<any>, next: HttpHandler) {
		this.totalRequests++
		this.spinner_service.set_spinning(true)

		return next.handle(request).pipe(
			finalize(() => {
				this.totalRequests--
				if (this.totalRequests === 0) {
					this.spinner_service.set_spinning(false)
				}
			}),
		)
	}
}

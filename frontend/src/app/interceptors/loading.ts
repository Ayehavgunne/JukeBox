import {Injectable} from "@angular/core"
import {
	HttpRequest,
	HttpHandler,
	HttpInterceptor,
	HttpEvent,
	HttpErrorResponse,
} from "@angular/common/http"
import {finalize, tap} from "rxjs/operators"
import {SpinnerService} from "../services/spinner.service"
import {Observable} from "rxjs"
import {Router} from "@angular/router"

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
	private totalRequests = 0

	constructor(private spinner_service: SpinnerService, private router: Router) {}

	intercept(
		request: HttpRequest<any>,
		next: HttpHandler,
	): Observable<HttpEvent<any>> {
		this.totalRequests++
		this.spinner_service.set_spinning(true)

		return next.handle(request).pipe(
			tap(
				() => {},
				(err: any) => {
					if (err instanceof HttpErrorResponse) {
						if (err.status !== 401) {
							return
						}
						this.router.navigateByUrl("/login").then()
					}
				},
			),
			finalize(() => {
				this.totalRequests--
				if (this.totalRequests === 0) {
					this.spinner_service.set_spinning(false)
				}
			}),
		)
	}
}

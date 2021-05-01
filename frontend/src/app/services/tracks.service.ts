import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Track} from "../models"
import {Observable} from "rxjs"

@Injectable({
	providedIn: "root",
})
export class TracksService {
	url: string = "/tracks"

	constructor(private http: HttpClient) {}

	get_tracks(track_id?: number): Observable<Track[]> {
		if (track_id) {
			return this.http.get<Track[]>(`${this.url}/${track_id}`)
		}
		return this.http.get<Track[]>(this.url)
	}
}

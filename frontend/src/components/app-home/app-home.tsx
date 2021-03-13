import {Component, h} from '@stencil/core';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.css',
    shadow: true,
})
export class AppHome {
    render() {
        return (
            <div>
                <p>
                    Welcome to my Jukebox. Something interesting should go here but I don't know what yet. For now{" "}
                    click on an option in the navigation panel on the left.
                </p>
            </div>
        );
    }
}

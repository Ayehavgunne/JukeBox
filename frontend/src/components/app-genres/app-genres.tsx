import {Component, Host, h} from '@stencil/core';

@Component({
    tag: 'app-genres',
    styleUrl: 'app-genres.css',
    shadow: true,
})
export class AppGenres {

    render() {
        return (
            <Host>
                <slot></slot>
            </Host>
        );
    }

}

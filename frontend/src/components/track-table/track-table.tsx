import {Component, Host, h} from '@stencil/core';

@Component({
    tag: 'track-table',
    styleUrl: 'track-table.css',
    shadow: true,
})
export class TrackTable {

    render() {
        return (
            <Host>
                <slot></slot>
            </Host>
        );
    }

}

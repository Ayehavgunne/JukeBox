import {Component, h, Listen, State} from '@stencil/core';

@Component({
    tag: 'play-button',
    styleUrl: 'play-button.css',
    shadow: true,
})
export class MyComponent {

    @State() status: boolean = true;

    @Listen('click')
    toggle() {
        console.log('toggled')
        this.status = !this.status
    }

    render() {
        return (
            this.status ? <div/> : <div class="pause"/>
        );
    }
}

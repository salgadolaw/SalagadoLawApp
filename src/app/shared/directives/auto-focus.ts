import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocus implements AfterViewInit {


  @Input('appAutoFocus') delayOrtick : number | string =0;
  constructor(private el: ElementRef<HTMLElement>) { }
  ngAfterViewInit() { this.run(); }
  ngOnChanges()     { this.run(); }
  private run() {
    const ms = Number(this.delayOrtick) || 0;
    setTimeout(() => this.el.nativeElement?.focus(), ms);
  }


}

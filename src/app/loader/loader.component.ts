import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  @Input() visible: boolean;
  @Input() localLoader: boolean;
  @Input() loaderSize = 10;

}
